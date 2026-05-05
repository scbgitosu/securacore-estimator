# securacore-estimator

## Iframe Embed Contract

This app sends height updates to its parent page so embedded mobile layouts (including Step 4 and the lead modal) remain fully visible.

- Child message payload: `{ type: 'setHeight', height: number }`
- Delivery channel: `window.parent.postMessage(...)`
- Trigger points: step changes, modal open/close, visual viewport changes, and layout resize events

### Parent page requirements

When embedding this app in an iframe (for example, in Wix), the parent should:

1. Listen for `message` events and apply `height` to the target iframe when `event.data?.type === 'setHeight'`.
2. Avoid fixed/max iframe heights that block resizing.
3. Avoid clipping wrappers around the iframe (for example, `overflow: hidden` on constrained-height containers).

Example parent listener:

```js
window.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || data.type !== 'setHeight') return;

  const iframe = document.querySelector('iframe[data-securacore-estimator]');
  if (!iframe) return;

  iframe.style.height = `${Math.ceil(data.height)}px`;
});
```
