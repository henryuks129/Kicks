// Broadcasts carry only invalidation signals; authoritative rows are fetched with RLS.
/** @param {{client: any, userId: string, refresh: (isCurrent: () => boolean) => Promise<unknown>, report: (message: string) => void, target?: any, documentTarget?: any, statusChanged?: (status: string) => void}} options */
export function subscribeCart({ client, userId, refresh, report, target = null, documentTarget = null, statusChanged = () => {} }) {
 let stopped = false, running = false, dirty = false;
 async function invalidate() {
  dirty = true;
  if (running || stopped) return;
  running = true;
  try {
   while (dirty && !stopped) {
    dirty = false;
    await refresh(() => !stopped);
   }
  } catch { if (!stopped) report('Your bag could not sync. Check your connection and reopen the app.'); }
  finally { running = false; }
 }
 const foreground = () => { if (documentTarget?.visibilityState === 'visible') invalidate(); };
 const channel = client.channel(`cart:${userId}`, { config: { private: true } })
  .on('broadcast', { event: 'changed' }, invalidate)
  .subscribe(status => {
   if(stopped)return;
   statusChanged(status);
   if (status === 'SUBSCRIBED') invalidate();
   if (['CHANNEL_ERROR', 'TIMED_OUT'].includes(status) && !stopped) report('Live bag sync is disconnected. Reopen the app when you’re online.');
  });
 target?.addEventListener('online', invalidate);
 target?.addEventListener('kicks:resume', invalidate);
 documentTarget?.addEventListener('visibilitychange', foreground);
 return () => {
  stopped = true;
  target?.removeEventListener('online', invalidate);
  target?.removeEventListener('kicks:resume', invalidate);
  documentTarget?.removeEventListener('visibilitychange', foreground);
  void client.removeChannel(channel);
 };
}
