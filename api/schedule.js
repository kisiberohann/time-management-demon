// api/schedule.js
import webPush from 'web-push';
import { publicKey, privateKey } from '../utils/vapid.js';

webPush.setVapidDetails(
  'mailto:i10784@nara.kosen-ac.jp',
  publicKey,
  privateKey
);

let scheduled = []; // メモリ保持（無料プランならOK）

export default async function handler(req, res) {
  console.log('cron実行！', new Date().toISOString());
  if (req.method === 'POST') {
    const { subscription, time, message } = req.body;
    scheduled.push({ subscription, time, message });
    return res.status(201).json({ message: '予約OK' });
  }

  // 毎分自動通知処理（擬似）
  const now = new Date();
  const hhmm = now.toTimeString().slice(0, 5);
  scheduled = scheduled.filter(item => {
    if (item.time === hhmm) {
      webPush.sendNotification(item.subscription, JSON.stringify({
        title: '通知',
        body: item.message || '通知です'
      })).catch(console.error);
      return false;
    }
    return true;
  });

  return res.status(200).json({ message: '確認済' });
}