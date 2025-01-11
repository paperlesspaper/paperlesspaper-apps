## Google Calendar

This integration displays Google Calendar entries. To display data you need to submit the data to the page via `window.postMessage`.

```jsx
window.postMessage(
  {
    cmd: "message",
    data: [
      {
        kind: "calendar#event",
        id: "1",
        summary: '"A short summary',
        description:
          "This is the description. It can be <b>html</b>. Be aware of the security risks.",
        start: { dateTime: "2024-09-23T10:00:00+02:00" },
        end: { dateTime: "2024-09-23T11:00:00+02:00" },
      },
    ],
  },
  "*"
);
```
