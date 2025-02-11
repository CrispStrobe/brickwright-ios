// Importation des modules nécessaires pour l'extension Scratch
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const ml5 = require('ml5'); // Bibliothèque ml5 pour utiliser les modèles de machine learning
const formatMessage = require('format-message'); // Gestion des messages multilingues
// Icone pour l'extension
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+Cjxzdmcgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDM1NyAzNTciIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgeG1sbnM6c2VyaWY9Imh0dHA6Ly93d3cuc2VyaWYuY29tLyIgc3R5bGU9ImZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxLjU7Ij4KICAgIDxnIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsLTEyOC43NDQsLTUuNjQ2NTEpIj4KICAgICAgICA8cmVjdCBpZD0iUGxhbi1kZS10cmF2YWlsMSIgc2VyaWY6aWQ9IlBsYW4gZGUgdHJhdmFpbDEiIHg9IjEyOC43NDQiIHk9IjUuNjQ3IiB3aWR0aD0iMzU2LjMwMSIgaGVpZ2h0PSIzNTYuMzAxIiBzdHlsZT0iZmlsbDpub25lOyIvPgogICAgICAgIDxnIHRyYW5zZm9ybT0ibWF0cml4KDEuMDAxMzQsMCwwLDEsLTAuMTcxOTQ4LDYuMjE3MjVlLTE1KSI+CiAgICAgICAgICAgIDxjbGlwUGF0aCBpZD0iX2NsaXAxIj4KICAgICAgICAgICAgICAgIDxyZWN0IHg9IjEyOC43NDQiIHk9IjUuNjQ3IiB3aWR0aD0iMzU2LjMwMSIgaGVpZ2h0PSIzNTYuMzAxIi8+CiAgICAgICAgICAgIDwvY2xpcFBhdGg+CiAgICAgICAgICAgIDxnIGNsaXAtcGF0aD0idXJsKCNfY2xpcDEpIj4KICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0ibWF0cml4KDUuNTE4MjIsMCwwLDEwLjkyODUsLTU1My4yNTQsLTE5My45NjcpIj4KICAgICAgICAgICAgICAgICAgICA8cmVjdCB4PSIxMjMuNTk0IiB5PSIxOC4xNjkiIHdpZHRoPSI2Ni4zMTIiIGhlaWdodD0iMzMuMTM3IiBzdHlsZT0iZmlsbDpyZ2IoMzgsMTY0LDI1Myk7c3Ryb2tlOnJnYigxOTksMCwxMjMpO3N0cm9rZS13aWR0aDowLjEycHg7Ii8+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8ZyBpZD0iRWxsaXBzZSIgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwwLjc0NDMzNSwwLjY0NjUwOCkiPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik00NDQsMTgwQzQ0NCwxMDguNzU1IDM4NS43OTcsNTEgMzE0LDUxQzI0Mi4yMDMsNTEgMTg0LDEwOC43NTUgMTg0LDE4MEMxODQsMjUxLjI0NSAyNDIuMjAzLDMwOSAzMTQsMzA5QzM4NS43OTcsMzA5IDQ0NCwyNTEuMjQ1IDQ0NCwxODBaIiBzdHlsZT0iZmlsbDp3aGl0ZTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6cmdiKDE4LDUsMTAyKTtzdHJva2Utd2lkdGg6OXB4O3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1taXRlcmxpbWl0OjQ7Ii8+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8ZyBpZD0iTGlnbmUiIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMC43NDQzMzUsMC42NDY1MDgpIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMzIwLDE3M0wzMDgsMTI2IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpyZ2IoOTMsODYsMTQzKTtzdHJva2Utd2lkdGg6OXB4O3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1taXRlcmxpbWl0OjQ7Ii8+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8ZyBpZD0icGF0aDEiIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMC43NDQzMzUsMC42NDY1MDgpIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMzU0LDI2M0wzMjksMjczIiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpyZ2IoOTMsODYsMTQzKTtzdHJva2Utd2lkdGg6OXB4O3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1taXRlcmxpbWl0OjQ7Ii8+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8ZyBpZD0icGF0aDIiIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMC43NDQzMzUsMC42NDY1MDgpIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMjY0LDI1MUwzMDQsMjcwIiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpyZ2IoOTMsODYsMTQzKTtzdHJva2Utd2lkdGg6MXB4O3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLW1pdGVybGltaXQ6MjsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJwYXRoMyIgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwwLjc0NDMzNSwwLjY0NjUwOCkiPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0yNzYsMTIwLjVDMjc2LDExMy41OTYgMjcwLjQwNCwxMDggMjYzLjUsMTA4QzI1Ni41OTYsMTA4IDI1MSwxMTMuNTk2IDI1MSwxMjAuNUMyNTEsMTI3LjQwNCAyNTYuNTk2LDEzMyAyNjMuNSwxMzNDMjcwLjQwNCwxMzMgMjc2LDEyNy40MDQgMjc2LDEyMC41WiIgc3R5bGU9ImZpbGw6d2hpdGU7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOnJnYigxOCw1LDEwMik7c3Ryb2tlLXdpZHRoOjlweDtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtbWl0ZXJsaW1pdDo0OyIvPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPGcgaWQ9IkVsbGlwc2UtY29waWUiIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMC43NDQzMzUsMC42NDY1MDgpIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMzczLDExMi41QzM3MywxMDUuNTk2IDM2Ny40MDQsMTAwIDM2MC41LDEwMEMzNTMuNTk2LDEwMCAzNDgsMTA1LjU5NiAzNDgsMTEyLjVDMzQ4LDExOS40MDQgMzUzLjU5NiwxMjUgMzYwLjUsMTI1QzM2Ny40MDQsMTI1IDM3MywxMTkuNDA0IDM3MywxMTIuNVoiIHN0eWxlPSJmaWxsOndoaXRlO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpyZ2IoMTgsNSwxMDIpO3N0cm9rZS13aWR0aDo5cHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJFbGxpcHNlLWNvcGllLTYiIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMC43NDQzMzUsMC42NDY1MDgpIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNDY2LDEyMC41QzQ2NiwxMTMuNTk2IDQ2MC40MDQsMTA4IDQ1My41LDEwOEM0NDYuNTk2LDEwOCA0NDEsMTEzLjU5NiA0NDEsMTIwLjVDNDQxLDEyNy40MDQgNDQ2LjU5NiwxMzMgNDUzLjUsMTMzQzQ2MC40MDQsMTMzIDQ2NiwxMjcuNDA0IDQ2NiwxMjAuNVoiIHN0eWxlPSJmaWxsOndoaXRlO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpyZ2IoMTgsNSwxMDIpO3N0cm9rZS13aWR0aDo5cHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJFbGxpcHNlLWNvcGllLTciIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMC43NDQzMzUsMC42NDY1MDgpIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTg3LDEyMC41QzE4NywxMTMuNTk2IDE4MS40MDQsMTA4IDE3NC41LDEwOEMxNjcuNTk2LDEwOCAxNjIsMTEzLjU5NiAxNjIsMTIwLjVDMTYyLDEyNy40MDQgMTY3LjU5NiwxMzMgMTc0LjUsMTMzQzE4MS40MDQsMTMzIDE4NywxMjcuNDA0IDE4NywxMjAuNVoiIHN0eWxlPSJmaWxsOndoaXRlO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpyZ2IoMTgsNSwxMDIpO3N0cm9rZS13aWR0aDo5cHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJFbGxpcHNlLWNvcGllLTIiIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMC43NDQzMzUsMC42NDY1MDgpIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMzM2LDE4NS41QzMzNiwxNzguNTk2IDMzMC40MDQsMTczIDMyMy41LDE3M0MzMTYuNTk2LDE3MyAzMTEsMTc4LjU5NiAzMTEsMTg1LjVDMzExLDE5Mi40MDQgMzE2LjU5NiwxOTggMzIzLjUsMTk4QzMzMC40MDQsMTk4IDMzNiwxOTIuNDA0IDMzNiwxODUuNVoiIHN0eWxlPSJmaWxsOndoaXRlO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpyZ2IoMTgsNSwxMDIpO3N0cm9rZS13aWR0aDo5cHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJFbGxpcHNlLWNvcGllLTMiIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMC43NDQzMzUsMC42NDY1MDgpIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMjY0LDI0MC41QzI2NCwyMzMuNTk2IDI1OC40MDQsMjI4IDI1MS41LDIyOEMyNDQuNTk2LDIyOCAyMzksMjMzLjU5NiAyMzksMjQwLjVDMjM5LDI0Ny40MDQgMjQ0LjU5NiwyNTMgMjUxLjUsMjUzQzI1OC40MDQsMjUzIDI2NCwyNDcuNDA0IDI2NCwyNDAuNVoiIHN0eWxlPSJmaWxsOndoaXRlO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpyZ2IoMTgsNSwxMDIpO3N0cm9rZS13aWR0aDo5cHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJFbGxpcHNlLWNvcGllLTQiIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMC43NDQzMzUsMC42NDY1MDgpIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMzI5LDI3NS41QzMyOSwyNjguNTk2IDMyMy40MDQsMjYzIDMxNi41LDI2M0MzMDkuNTk2LDI2MyAzMDQsMjY4LjU5NiAzMDQsMjc1LjVDMzA0LDI4Mi40MDQgMzA5LjU5NiwyODggMzE2LjUsMjg4QzMyMy40MDQsMjg4IDMyOSwyODIuNDA0IDMyOSwyNzUuNVoiIHN0eWxlPSJmaWxsOndoaXRlO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpyZ2IoMTgsNSwxMDIpO3N0cm9rZS13aWR0aDo5cHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJwYXRoNCIgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwwLjc0NDMzNSwwLjY0NjUwOCkiPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xODcsMTI1TDI1MSwxMjAiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOnJnYig5Myw4NiwxNDMpO3N0cm9rZS13aWR0aDoycHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJwYXRoNSIgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwwLjc0NDMzNSwwLjY0NjUwOCkiPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xODQsMTI5TDIzOSwyMjgiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOnJnYig5Myw4NiwxNDMpO3N0cm9rZS13aWR0aDoycHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJwYXRoNiIgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwwLjc0NDMzNSwwLjY0NjUwOCkiPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0yNTIsMjI4TDI2NCwxMzMiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOnJnYig5Myw4NiwxNDMpO3N0cm9rZS13aWR0aDoycHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJwYXRoNyIgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwwLjc0NDMzNSwwLjY0NjUwOCkiPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0yNzYsMTIwTDM0OCwxMTIiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOnJnYig5Myw4NiwxNDMpO3N0cm9rZS13aWR0aDoycHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJwYXRoOCIgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwwLjc0NDMzNSwwLjY0NjUwOCkiPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0zNzMsMTEyTDQ0MSwxMTYiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOnJnYig5Myw4NiwxNDMpO3N0cm9rZS13aWR0aDoycHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJwYXRoOSIgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwwLjc0NDMzNSwwLjY0NjUwOCkiPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik00NDksMTMzTDM4MCwyNDgiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOnJnYig5Myw4NiwxNDMpO3N0cm9rZS13aWR0aDoycHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJwYXRoMTAiIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMC43NDQzMzUsMC42NDY1MDgpIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMzYxLDI0NEwzMjksMTk4IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpyZ2IoOTMsODYsMTQzKTtzdHJva2Utd2lkdGg6MnB4O3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1taXRlcmxpbWl0OjQ7Ii8+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8ZyBpZD0icGF0aDExIiB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwxLDAuNzQ0MzM1LDAuNjQ2NTA4KSI+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTMyOSwxNzVMMzYxLDEyNiIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6cmdiKDkzLDg2LDE0Myk7c3Ryb2tlLXdpZHRoOjNweDtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtbWl0ZXJsaW1pdDo0OyIvPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPGcgaWQ9InBhdGgxMiIgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwwLjc0NDMzNSwwLjY0NjUwOCkiPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0zNjgsMTI1TDM2OCwyNDAiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOnJnYig5Myw4NiwxNDMpO3N0cm9rZS13aWR0aDoycHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJwYXRoMTMiIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMC43NDQzMzUsMC42NDY1MDgpIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMzIwLDI2M0wzMjAsMTk4IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpyZ2IoOTMsODYsMTQzKTtzdHJva2Utd2lkdGg6M3B4O3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1taXRlcmxpbWl0OjQ7Ii8+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8ZyBpZD0icGF0aDE0IiB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwxLDAuNzQ0MzM1LDAuNjQ2NTA4KSI+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTMwNCwyNzNMMjY0LDI0OCIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6cmdiKDkzLDg2LDE0Myk7c3Ryb2tlLXdpZHRoOjlweDtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtbWl0ZXJsaW1pdDo0OyIvPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPGcgaWQ9InBhdGgxNSIgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwwLjc0NDMzNSwwLjY0NjUwOCkiPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0zMTEsMjYzTDI2NCwxMzkiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOnJnYig5Myw4NiwxNDMpO3N0cm9rZS13aWR0aDoycHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJwYXRoMTYiIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMC43NDQzMzUsMC42NDY1MDgpIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTgxLDEyNUwzMTEsMjYzIiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpyZ2IoOTMsODYsMTQzKTtzdHJva2Utd2lkdGg6MnB4O3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1taXRlcmxpbWl0OjQ7Ii8+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8ZyBpZD0icGF0aDE3IiB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwxLDAuNzQ0MzM1LDAuNjQ2NTA4KSI+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTQ0MSwxMjBMMzM2LDE4MCIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6cmdiKDkzLDg2LDE0Myk7c3Ryb2tlLXdpZHRoOjJweDtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtbWl0ZXJsaW1pdDo0OyIvPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPGcgaWQ9InBhdGgxOCIgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwwLjc0NDMzNSwwLjY0NjUwOCkiPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0zMDgsMTg1TDE4NywxMjkiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOnJnYig5Myw4NiwxNDMpO3N0cm9rZS13aWR0aDoycHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJwYXRoMTkiIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMC43NDQzMzUsMC42NDY1MDgpIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNDQxLDEyNkwzMjQsMjYzIiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpyZ2IoOTMsODYsMTQzKTtzdHJva2Utd2lkdGg6MnB4O3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1taXRlcmxpbWl0OjQ7Ii8+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8ZyBpZD0icGF0aDIwIiB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwxLDAuNzQ0MzM1LDAuNjQ2NTA4KSI+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTI0NiwyNTNMMjI1LDI3NyIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6cmdiKDkzLDg2LDE0Myk7c3Ryb2tlLXdpZHRoOjJweDtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtbWl0ZXJsaW1pdDo0OyIvPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPGcgaWQ9InBhdGgyMSIgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwwLjc0NDMzNSwwLjY0NjUwOCkiPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0zMDQsMjc2Ljk5OUwyMzAsMjc3IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpyZ2IoOTMsODYsMTQzKTtzdHJva2Utd2lkdGg6MnB4O3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1taXRlcmxpbWl0OjQ7Ii8+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8ZyBpZD0icGF0aDIyIiB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwxLDAuNzQ0MzM1LDAuNjQ2NTA4KSI+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTMyMCwyODhMMzI5LDMwOSIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6cmdiKDkzLDg2LDE0Myk7c3Ryb2tlLXdpZHRoOjJweDtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtbWl0ZXJsaW1pdDo0OyIvPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPGcgaWQ9InBhdGgyMyIgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwwLjc0NDMzNSwwLjY0NjUwOCkiPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0zNzMsMjY5TDMyOSwzMDkiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOnJnYig5Myw4NiwxNDMpO3N0cm9rZS13aWR0aDoycHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJwYXRoMjQiIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMC43NDQzMzUsMC42NDY1MDgpIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMjM2LDI0MEwxODEsMjAxIiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpyZ2IoOTMsODYsMTQzKTtzdHJva2Utd2lkdGg6MnB4O3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1taXRlcmxpbWl0OjQ7Ii8+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8ZyBpZD0icGF0aDI1IiB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwxLDAuNzQ0MzM1LDAuNjQ2NTA4KSI+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTE3NSwxMzNMMTgxLDIwMSIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6cmdiKDkzLDg2LDE0Myk7c3Ryb2tlLXdpZHRoOjJweDtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtbWl0ZXJsaW1pdDo0OyIvPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPGcgaWQ9InBhdGgyNiIgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwwLjc0NDMzNSwwLjY0NjUwOCkiPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0zODAsMjYwTDQxNywyNTYiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOnJnYig5Myw4NiwxNDMpO3N0cm9rZS13aWR0aDoycHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJwYXRoMjciIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMC43NDQzMzUsMC42NDY1MDgpIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMzYxLDEwMEwzMTQsNTEiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOnJnYig5Myw4NiwxNDMpO3N0cm9rZS13aWR0aDoycHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJwYXRoMjgiIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMC43NDQzMzUsMC42NDY1MDgpIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMjY0LDEwOEwzMTcsNTEiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOnJnYig5Myw4NiwxNDMpO3N0cm9rZS13aWR0aDoycHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJwYXRoMjkiIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMC43NDQzMzUsMC42NDY1MDgpIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTc1LDEwOEwzMTQsNTEiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOnJnYig5Myw4NiwxNDMpO3N0cm9rZS13aWR0aDoycHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJwYXRoMzAiIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMC43NDQzMzUsMC42NDY1MDgpIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNDQxLDEwOEwzMjAsNTEiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOnJnYig5Myw4NiwxNDMpO3N0cm9rZS13aWR0aDoycHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxnIGlkPSJFbGxpcHNlLWNvcGllLTUiIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMC43NDQzMzUsMC42NDY1MDgpIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMzgwLDI1Ni41QzM4MCwyNDkuNTk2IDM3NC40MDQsMjQ0IDM2Ny41LDI0NEMzNjAuNTk2LDI0NCAzNTUsMjQ5LjU5NiAzNTUsMjU2LjVDMzU1LDI2My40MDQgMzYwLjU5NiwyNjkgMzY3LjUsMjY5QzM3NC40MDQsMjY5IDM4MCwyNjMuNDA0IDM4MCwyNTYuNVoiIHN0eWxlPSJmaWxsOndoaXRlO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpyZ2IoMTgsNSwxMDIpO3N0cm9rZS13aWR0aDo5cHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDsiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+Cg==';

// Déclaration des locales disponibles pour l'extension
const AvailableLocales = ['en', 'fr', 'de'];

//Traductions des textes utilisés par l'extension
const Message = {
	activateFacemesh: {
		'en': 'activate facemesh',
		'fr': 'activer le maillage du visage',
		'de': 'facemesh aktivieren'

	},
	please_wait: {
		'en': 'Setup takes a while. The browser will get stuck, but please wait.',
		'fr': 'Le temps de chargement peut être un peu long, merci de patienter.',
		'de': 'Die Ladezeit kann etwas länger dauern, bitte haben Sie etwas Geduld.'
	},
	videoToggle: {
		'en': 'turn video [VIDEO_STATE]',
		'fr': 'mettre caméra sur [VIDEO_STATE]',
		'de': 'schalte Video [VIDEO_STATE]'
	},
	onfront: {
		'en': 'front camera on',
		'fr': 'allumer caméra avant',
		'de': 'Frontkamera einschalten'
	},
	onback: {
		'en': 'back camera on',
		'fr': 'allumer caméra arrière',
		'de': 'Rückfahrkamera einschalten'
	},
	off: {
		'en': 'camera off',
		'fr': 'arrêter la caméra',
		'de': 'Stopp Kamera'
	},
	video_on_flipped: {
		'en': 'flip camera image',
		'fr': 'retourner l\'image de la caméra',
		'de': 'Kameraspiegel'
	},
	getX: {
		'en': 'x position of keypoint [KEYPOINT] of person [PERSON_NUMBER]',
		'fr': 'abscisse x du point [KEYPOINT] de la personne [PERSON_NUMBER]',
		'de': 'x-Position des Keypoints [KEYPOINT] der Person [PERSON_NUMBER]'
	},
	getY: {
		'en': 'y position of keypoint [KEYPOINT] of person [PERSON_NUMBER]',
		'fr': 'ordonnée y du point [KEYPOINT] de la personne [PERSON_NUMBER]',
		'de': 'y-Position des Keypoints [KEYPOINT] der Person [PERSON_NUMBER]'
	},
	peopleCount: {
		'en': 'people count',
		'fr': 'nombre de personnes',
		'de': 'Zahl der Personen'
	},
	active: {
		'en': 'facemesh activated ?',
		'fr': 'maillage du visage activée ?',
		'de': 'facemesh aktiviert ?'

	}
}

function createMenu(count) {
	return Array.from({
		length: count
	}, (_, i) => ({
		text: (i + 1).toString(),
		value: (i + 1).toString()
	}));
}

// Déclaration de la classe principale pour les blocs Scratch des points du visage
class Scratch3FacemeshBlocks {
	// Menu pour sélectionner le nombre de personnes détectées
	get PERSON_NUMBER_MENU() {
		return createMenu(10);
	}

	get KEYPOINT_MENU() {
		return createMenu(468);
	}

	// Menu pour gérer l'état de la caméra vidéo
	get VIDEO_MENU() {
		return [
			'onback', 'onfront', 'video_on_flipped', 'off'
		].map(key => ({
			text: Message[key][this._locale],
			value: key
		}));
	}

	constructor(runtime) {
		this.runtime = runtime; // Référence au runtime Scratch

		this.faces = []; // Tableau pour stocker les points du visage
		this.ratio = 0.75;
		this.active = false; // Indicateur d'activation de la détection des points du visage
		this._locale = this.setLocale();

		// Fonction pour détecter les points du visage
		this.detectFace = () => {
			// Configuration de la vidéo
			this.video = this.runtime.ioDevices.video.provider.video
			this.video.width = 480;
			this.video.height = 360;
			this.video.autoplay = true;
			alert(Message.please_wait[this._locale]);

			// Initialisation de FaceMesh via ml5
			this.facemesh = ml5.facemesh(this.video, function() {
				console.log("Model loaded!") // Indication que le modèle est chargé
			});

			// Gestion des événements lorsque des points du visage sont détectés
			this.facemesh.on('predict', faces => {
				if (faces.length < this.faces.length) {
					this.faces.splice(faces.length);
				}
				faces.forEach((face, index) => {
					this.faces[index] = {
						keypoints: face.scaledMesh
					}; // Stockage des points du visage
				});
			});
		}

	}

	// Fonction pour fournir des informations sur les blocs
	getInfo() {

		const COLORS = {
			primary: '#26a4fd',
			secondary: '#055c9a'
		};

		return {
			id: 'facemesh',
			name: 'Facemesh',
			color1: COLORS.primary,
			color2: COLORS.secondary,
			blockIconURI: blockIconURI,
			blocks: [{
					opcode: 'activateFacemesh',
					blockType: BlockType.COMMAND,
					text: Message.activateFacemesh[this._locale],
				},
				{
					opcode: 'activated',
					text: Message.active[this._locale],
					blockType: BlockType.BOOLEAN
				},
				'---',
				'---',
				{
					opcode: 'videoToggle',
					blockType: BlockType.COMMAND,
					text: Message.videoToggle[this._locale],
					arguments: {
						VIDEO_STATE: {
							type: ArgumentType.STRING,
							menu: 'videoMenu',
							defaultValue: 'onfront'
						}
					}
				},
				{
					opcode: 'setVideoTransparency',
					text: formatMessage({
						id: 'videoSensing.setVideoTransparency',
						default: 'set video transparency to [TRANSPARENCY]',
						description: 'Controls transparency of the video preview layer'
					}),
					arguments: {
						TRANSPARENCY: {
							type: ArgumentType.NUMBER,
							defaultValue: 50
						}
					}
				},
				'---',
				'---',
				{
					opcode: 'getX',
					blockType: BlockType.REPORTER,
					text: Message.getX[this._locale],
					arguments: {
						PERSON_NUMBER: {
							type: ArgumentType.STRING,
							menu: 'personNumberMenu',
							defaultValue: '1'
						},
						KEYPOINT: {
							type: ArgumentType.STRING,
							menu: 'keypointMenu',
							defaultValue: '1'
						}
					}
				},
				{
					opcode: 'getY',
					blockType: BlockType.REPORTER,
					text: Message.getY[this._locale],
					arguments: {
						PERSON_NUMBER: {
							type: ArgumentType.STRING,
							menu: 'personNumberMenu',
							defaultValue: '1'
						},
						KEYPOINT: {
							type: ArgumentType.STRING,
							menu: 'keypointMenu',
							defaultValue: '1'
						}
					}
				},
				{
					opcode: 'getPeopleCount',
					blockType: BlockType.REPORTER,
					text: Message.peopleCount[this._locale]
				}
			],
			menus: {
				personNumberMenu: {
					acceptReporters: true,
					items: this.PERSON_NUMBER_MENU
				},
				keypointMenu: {
					acceptReporters: true,
					items: this.KEYPOINT_MENU
				},
				videoMenu: {
					acceptReporters: true,
					items: this.VIDEO_MENU
				}
			}
		};
	}

	getKeypointPosition(personNumber, keypoint, axis) {
		const person = this.faces[parseInt(personNumber, 10) - 1];
		if (person && person.keypoints[keypoint]) {
			return axis === 'x' ? person.keypoints[keypoint][0] * this.ratio : person.keypoints[keypoint][1] * this.ratio;
		}
		return '';
	}

	getX(args) {
		const keypointPosition = this.getKeypointPosition(args.PERSON_NUMBER, args.KEYPOINT, 'x');
		return this.runtime.ioDevices.video.mirror ? 240 - keypointPosition : -1 * (240 - keypointPosition);
	}

	getY(args) {
		return 180 - this.getKeypointPosition(args.PERSON_NUMBER, args.KEYPOINT, 'y');
	}

	getPeopleCount() {
		return this.faces.length;
	}

	activateFacemesh(args) {
		if (!this.runtime.ioDevices.video.videoReady) {
			alert('Il faut d\'abord activer la vidéo');
		} else {
			this.active = true;
			this.detectFace();
		}
	}
	activated(args, util) {
		return this.active;
	}

	// Fonction permettant d'activer la vidéo et de changer de caméra
	videoToggle(args) {
		switch (args.VIDEO_STATE) {
			case 'off':
				this.runtime.ioDevices.video.disableVideo();
				if (this.active) {
					this.facemesh = null;
					this.active = false;
				}
				break;
			case 'onback':
				this.runtime.ioDevices.video.enableVideo('environment');
				this.runtime.ioDevices.video.mirror = false;
				break;
			case 'onfront':
				this.runtime.ioDevices.video.enableVideo('user');
				this.runtime.ioDevices.video.mirror = true;
				break;
			default:
				this.runtime.ioDevices.video.mirror = !this.runtime.ioDevices.video.mirror;
		}

	}

	// Fonction permettant de changer la transparence d'affichage de la caméra sur la scène
	setVideoTransparency(args) {
		const transparency = Cast.toNumber(args.TRANSPARENCY);
		this.globalVideoTransparency = transparency;
		this.runtime.ioDevices.video.setPreviewGhost(transparency);
	}

	// Fonction permettant de définir la langue de l'extension en fonction de la langue définit dans Scratch.
	// Si la traduction d'une langue n'est pas disponible dans l'extension, c'est l'anglais qui est choisi
	setLocale() {
		let locale = formatMessage.setup().locale;
		return AvailableLocales.includes(locale) ? locale : 'en';
	}
}

module.exports = Scratch3FacemeshBlocks;