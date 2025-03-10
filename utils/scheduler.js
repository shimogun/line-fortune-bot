/**
 * 定期配信機能を提供するモジュール
 */

// ユーザー情報保存用のインメモリDBの代わりとなるオブジェクト
const userDatabase = {};

/**
 * 定期配信用にユーザー情報を登録する
 * @param {string} userId - LINEユーザーID
 * @param {Object} data - ユーザーデータ
 */
function registerUser(userId, data) {
  userDatabase[userId] = {
    ...userDatabase[userId],
    ...data,
    registeredAt: new Date(),
    lastActive: new Date()
  };
  console.log(`User ${userId} registered for daily updates`);
}

/**
 * スケジューラーを初期化する
 * @param {Object} lineClient - LINE Bot SDK クライアント
 */
function initScheduler(lineClient) {
  console.log('Scheduler initialized');
  
  // 1日1回、定期的にメッセージを配信（デモ用に短い間隔で設定可能）
  // 本番環境では、cron形式のスケジューラーを使用する
  
  // テスト用：5分ごとにアクティブなユーザーにメッセージを送信
  const intervalMinutes = 5;
  console.log(`Scheduled to send messages every ${intervalMinutes} minutes`);
  
  setInterval(() => {
    sendDailyFortunes(lineClient);
  }, intervalMinutes * 60 * 1000);
}

/**
 * 登録されたすべてのユーザーに占い結果を送信する
 * @param {Object} lineClient - LINE Bot SDK クライアント
 */
async function sendDailyFortunes(lineClient) {
  console.log('Sending daily fortunes...');
  const now = new Date();
  
  // 登録されたすべてのユーザーに対して処理
  for (const userId in userDatabase) {
    try {
      // 最後のアクティブから24時間以内のユーザーにのみ送信
      const lastActive = userDatabase[userId].lastActive;
      const hoursSinceLastActive = (now - lastActive) / (1000 * 60 * 60);
      
      if (hoursSinceLastActive < 24) {
        // ユーザーごとにカスタマイズされたメッセージを作成
        const message = generateDailyMessage(userId);
        
        // メッセージを送信
        await lineClient.pushMessage(userId, message);
        console.log(`Daily fortune sent to user ${userId}`);
        
        // 最終送信日時を更新
        userDatabase[userId].lastMessageSent = now;
      }
    } catch (error) {
      console.error(`Error sending message to user ${userId}:`, error);
    }
  }
}

/**
 * ユーザーごとにカスタマイズされた日次メッセージを生成する
 * @param {string} userId - LINEユーザーID
 * @returns {Object} LINEメッセージオブジェクト
 */
function generateDailyMessage(userId) {
  const userData = userDatabase[userId] || {};
  const lastFortune = userData.lastFortune || '運勢は常に変化しています';
  
  // 曜日に応じたメッセージ
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const today = new Date();
  const dayOfWeek = days[today.getDay()];
  
  return {
    type: 'text',
    text: `おはようございます！${dayOfWeek}曜日の運勢をお届けします。\n\n前回の占い結果は「${lastFortune}」でした。\n\n今日も素敵な一日をお過ごしください。`
  };
}

module.exports = {
  registerUser,
  initScheduler
};