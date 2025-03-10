const express = require('express');
const line = require('@line/bot-sdk');
const fortuneTeller = require('./utils/fortune');
const scheduler = require('./utils/scheduler');

const app = express();

// LINE Bot設定
const lineConfig = {
  channelAccessToken: 'ApNY3B48gNlRyAnAxgetTHuyiUD8reCwm4viEJz2+motnWROM2En7i3SzTs+loyconyNwyPhn4Az/9DHeWMN3fhsKp+8qu0bAy6JhGn6M/OcZDXE1547bl7tlLj9iXUO4R84ZCj3a4RRpp/FeRbXgAdB04t89/1O/w1cDnyilFU=',
  channelSecret: 'd6a91d47c64ff374d8fc76aa67d3e28d'
};

const client = new line.Client(lineConfig);

// Webフックエンドポイント
app.post('/webhook', line.middleware(lineConfig), async (req, res) => {
  try {
    const events = req.body.events;
    await Promise.all(events.map(event => handleEvent(event)));
    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

// イベントハンドラー
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  const userMessage = event.message.text;
  const userId = event.source.userId;
  
  // ユーザーメッセージの処理
  if (userMessage.includes('占い') || userMessage.includes('運勢') || userMessage.includes('今日')) {
    return handleFortuneRequest(event.replyToken, userId, userMessage);
  } else if (userMessage.includes('誕生日') || userMessage.includes('生年月日')) {
    return handleBirthdayInput(event.replyToken, userId, userMessage);
  } else {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'こんにちは！「今日の占い」と送信すると、あなたの運勢を占います。'
    });
  }
}

// 占いリクエストの処理
async function handleFortuneRequest(replyToken, userId, message) {
  const fortune = fortuneTeller.getFortune(message);
  
  // 定期配信用にユーザー情報を保存
  scheduler.registerUser(userId, {
    lastMessage: message,
    lastFortune: fortune.summary
  });

  return client.replyMessage(replyToken, [
    {
      type: 'text',
      text: `${fortune.greeting}\n\n${fortune.summary}`
    },
    {
      type: 'image',
      originalContentUrl: fortune.imageUrl,
      previewImageUrl: fortune.imageUrl
    },
    {
      type: 'template',
      altText: '続きを見る',
      template: {
        type: 'buttons',
        text: '詳細な占い結果を見る',
        actions: [
          {
            type: 'uri',
            label: '続きを見る',
            uri: 'https://example.com/fortune-details'
          }
        ]
      }
    }
  ]);
}

// 生年月日入力の処理
async function handleBirthdayInput(replyToken, userId, message) {
  return client.replyMessage(replyToken, {
    type: 'text',
    text: 'あなたの生年月日を承りました。鑑定書を準備中です...'
  });
}

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // 定期配信スケジューラーを起動
  scheduler.initScheduler(client);
});