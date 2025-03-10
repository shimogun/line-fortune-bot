/**
 * 占い機能を提供するモジュール
 */

// 占いのタイプと結果のテンプレート
const fortuneTypes = ['今日の運勢', '恋愛運', '金運', '仕事運', '健康運'];
const fortuneLevels = ['大吉', '吉', '中吉', '小吉', '末吉', '凶'];
const fortuneMessages = {
  '大吉': [
    'とても素晴らしい一日になるでしょう。思い切った行動が吉と出ています。',
    '迷っていることは即決しましょう。すべてがうまくいく兆候です。',
    '人との出会いに恵まれる日です。積極的に交流を持ちましょう。'
  ],
  '吉': [
    '良い流れが来ています。チャンスを逃さず前進しましょう。',
    '直感を信じて行動すると良い結果につながります。',
    '新しいことに挑戦するのに適した日です。'
  ],
  '中吉': [
    '穏やかな一日になりそうです。無理せず自分のペースを守りましょう。',
    '小さな幸せを大切にすると、より豊かな気持ちになれます。',
    '計画通りに進めれば、順調に物事が進みます。'
  ],
  '小吉': [
    '慎重に行動すれば、困難を避けられます。',
    '周囲からのアドバイスに耳を傾けると良いでしょう。',
    '地道な努力が将来報われる兆しがあります。'
  ],
  '末吉': [
    '予期せぬ出来事に注意が必要です。柔軟な対応を心がけましょう。',
    '焦らず着実に進むことが大切です。',
    '一度立ち止まって、計画を見直す時期かもしれません。'
  ],
  '凶': [
    '慎重な行動を心がけましょう。時には休息も必要です。',
    '困難があっても、それは成長のチャンスと捉えましょう。',
    '人に頼ることも大切です。助けを求めることをためらわないでください。'
  ]
};

// 占い画像のURL（プレースホルダー）
const fortuneImages = {
  '大吉': 'https://via.placeholder.com/600x400.png?text=大吉',
  '吉': 'https://via.placeholder.com/600x400.png?text=吉',
  '中吉': 'https://via.placeholder.com/600x400.png?text=中吉',
  '小吉': 'https://via.placeholder.com/600x400.png?text=小吉',
  '末吉': 'https://via.placeholder.com/600x400.png?text=末吉',
  '凶': 'https://via.placeholder.com/600x400.png?text=凶'
};

/**
 * ユーザーのメッセージに応じた占い結果を生成する
 * @param {string} message - ユーザーからのメッセージ
 * @returns {Object} 占い結果オブジェクト
 */
function getFortune(message) {
  // ランダムに占いレベルを選択
  const level = fortuneLevels[Math.floor(Math.random() * fortuneLevels.length)];
  
  // メッセージの内容から占いのタイプを決定（デフォルトは今日の運勢）
  let type = fortuneTypes[0];
  for (const t of fortuneTypes) {
    if (message.includes(t)) {
      type = t;
      break;
    }
  }
  
  // ランダムにメッセージを選択
  const messageList = fortuneMessages[level];
  const fortuneMessage = messageList[Math.floor(Math.random() * messageList.length)];
  
  // 挨拶メッセージを生成
  const greeting = `${type}を占いました。`;
  
  // 占い結果を生成
  const summary = `【結果: ${level}】\n${fortuneMessage}`;
  
  // 詳細な結果（実際のアプリでは拡張可能）
  const details = `${fortuneMessage}\n\n今日のラッキーカラーは、${getRandomColor()}です。\n落ち着いた気持ちで過ごすと良いでしょう。`;
  
  return {
    greeting,
    type,
    level,
    summary,
    details,
    imageUrl: fortuneImages[level]
  };
}

/**
 * ランダムな色を返す
 * @returns {string} 色の名前
 */
function getRandomColor() {
  const colors = ['赤', '青', '緑', '黄', '紫', 'オレンジ', 'ピンク', '水色', '白', '黒'];
  return colors[Math.floor(Math.random() * colors.length)];
}

module.exports = {
  getFortune
};