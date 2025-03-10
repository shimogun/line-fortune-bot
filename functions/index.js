const functions = require('firebase-functions');
const express = require('express');
const line = require('@line/bot-sdk');

const app = express();

// LINE Bot設定
const lineConfig = {
  channelAccessToken: 'ApNY3B48gNlRyAnAxgetTHuyiUD8reCwm4viEJz2+motnWROM2En7i3SzTs+loyconyNwyPhn4Az/9DHeWMN3fhsKp+8qu0bAy6JhGn6M/OcZDXE1547bl7tlLj9iXUO4R84ZCj3a4RRpp/FeRbXgAdB04t89/1O/w1cDnyilFU=',
  channelSecret: 'd6a91d47c64ff374d8fc76aa67d3e28d'
};

const client = new line.Client(lineConfig);

// 占い機能
const fortuneTypes = ['今日の運勢', '恋愛運', '金運', '仕事運', '健康運'];
const fortuneLevels = ['大吉', '吉', '中吉', '小吉', '末吉', '凶'];
const fortuneMessages = {
  '大吉': ['とても素晴らしい一日になるでしょう。思い切った行動が吉と出ています。'],
  '吉': ['良い流れが来ています。チャンスを逃さず前進しましょう。'],
  '中吉': ['穏やかな一日になりそうです。無理せず自分のペースを守りましょう。'],
  '小吉': ['慎重に行動すれば、困難を避けられます。'],
  '末吉': ['予期せぬ出来事に注意が必要です。柔軟な対応を心がけましょう。'],
  '凶': ['慎重な行動を心がけましょう。時には休息も必要です。']
};

const fortuneImages = {
  '大吉': 'https://via.placeholder.com/600x400.png?text=大吉',
  '吉': 'https://via.placeholder.com/600x400.png?text=吉',
  '中吉': 'https://via.placeholder.com/600x400.png?text=中吉',
  '小吉': 'https://via.placeholder.com/600x400.png?text=小吉',
  '末吉': 'https://via.placeholder.com/600x400.png?text=末吉',
  '凶': 'https://via.placeholder.com/600x400.png?text=凶'
};

// 占い結果を生成する関数
function getFortune(message) {
  const level = fortuneLevels[Math.floor(Math.random() * fortuneLevels.length)];
  let type = fortuneTypes[0];
  for (const t of fortuneTypes) {
    if (message.includes(t)) {
      type = t;
      break;
    }
  }
  
  const messageList = fortuneMessages[level];
  const fortuneMessage = messageList[Math.floor(Math.random() * messageList.length)];
  
  const greeting = `${type}を占いました。`;
  const summary = `【結果: ${level}】\n${fortuneMessage}`;
  
  return {
    greeting,
    type,
    level,
    summary,
    imageUrl: fortuneImages[level]
  };
}

// Webフックエンドポイント
app.post('/webhook', line.middleware(lineConfig), async (req, res) => {
  try {
    console.log('Webhook received!');
    const events = req.body.events;
    await Promise.all(events.map(event => handleEvent(event)));
    res.status(200).end();
  } catch (err) {
    console.error('Error in webhook:', err);
    res.status(500).end();
  }
});

// イベントハンドラー
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  const userMessage = event.message.text;
  
  // ユーザーメッセージの処理
  if (userMessage.includes('占い') || userMessage.includes('運勢') || userMessage.includes('今日')) {
    const fortune = getFortune(userMessage);
    
    return client.replyMessage(event.replyToken, [
      {
        type: 'text',
        text: `${fortune.greeting}\n\n${fortune.summary}`
      },
      {
        type: 'image',
        originalContentUrl: fortune.imageUrl,
        previewImageUrl: fortune.imageUrl
      }
    ]);
  } else if (userMessage.includes('誕生日') || userMessage.includes('生年月日')) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'あなたの生年月日を承りました。鑑定書を準備中です...'
    });
  } else {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'こんにちは！「今日の占い」と送信すると、あなたの運勢を占います。'
    });
  }
}

// テスト用エンドポイント
app.get('/test', (req, res) => {
  res.status(200).send('Bot server is running!');
});

// Expressアプリをエクスポート
exports.app = functions.https.onRequest(app);