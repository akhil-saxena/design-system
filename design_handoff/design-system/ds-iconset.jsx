/* ═══ ICON SET REFERENCE — expanded ═══ */

const ICONS = [
	// Navigation
	{
		n: "home",
		g: "Navigation",
		el: (
			<>
				<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
				<path d="M9 22V12h6v10" />
			</>
		),
	},
	{
		n: "compass",
		g: "Navigation",
		el: (
			<>
				<circle cx="12" cy="12" r="10" />
				<polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
			</>
		),
	},
	{
		n: "map",
		g: "Navigation",
		el: (
			<>
				<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
				<line x1="8" y1="2" x2="8" y2="18" />
				<line x1="16" y1="6" x2="16" y2="22" />
			</>
		),
	},
	{
		n: "menu",
		g: "Navigation",
		el: (
			<>
				<line x1="3" y1="12" x2="21" y2="12" />
				<line x1="3" y1="6" x2="21" y2="6" />
				<line x1="3" y1="18" x2="21" y2="18" />
			</>
		),
	},
	{
		n: "more-horiz",
		g: "Navigation",
		el: (
			<>
				<circle cx="12" cy="12" r="1" />
				<circle cx="19" cy="12" r="1" />
				<circle cx="5" cy="12" r="1" />
			</>
		),
	},
	{
		n: "more-vert",
		g: "Navigation",
		el: (
			<>
				<circle cx="12" cy="12" r="1" />
				<circle cx="12" cy="5" r="1" />
				<circle cx="12" cy="19" r="1" />
			</>
		),
	},
	{
		n: "arrow-up",
		g: "Navigation",
		el: (
			<>
				<line x1="12" y1="19" x2="12" y2="5" />
				<polyline points="5 12 12 5 19 12" />
			</>
		),
	},
	{
		n: "arrow-down",
		g: "Navigation",
		el: (
			<>
				<line x1="12" y1="5" x2="12" y2="19" />
				<polyline points="19 12 12 19 5 12" />
			</>
		),
	},
	{
		n: "arrow-left",
		g: "Navigation",
		el: (
			<>
				<line x1="19" y1="12" x2="5" y2="12" />
				<polyline points="12 19 5 12 12 5" />
			</>
		),
	},
	{
		n: "arrow-right",
		g: "Navigation",
		el: (
			<>
				<line x1="5" y1="12" x2="19" y2="12" />
				<polyline points="12 5 19 12 12 19" />
			</>
		),
	},
	{
		n: "chevron-up",
		g: "Navigation",
		el: (
			<>
				<polyline points="18 15 12 9 6 15" />
			</>
		),
	},
	{
		n: "chevron-down",
		g: "Navigation",
		el: (
			<>
				<polyline points="6 9 12 15 18 9" />
			</>
		),
	},
	{
		n: "chevron-left",
		g: "Navigation",
		el: (
			<>
				<polyline points="15 18 9 12 15 6" />
			</>
		),
	},
	{
		n: "chevron-right",
		g: "Navigation",
		el: (
			<>
				<polyline points="9 18 15 12 9 6" />
			</>
		),
	},
	{
		n: "corner-up-left",
		g: "Navigation",
		el: (
			<>
				<polyline points="9 14 4 9 9 4" />
				<path d="M20 20v-7a4 4 0 0 0-4-4H4" />
			</>
		),
	},
	{
		n: "external",
		g: "Navigation",
		el: (
			<>
				<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
				<polyline points="15 3 21 3 21 9" />
				<line x1="10" y1="14" x2="21" y2="3" />
			</>
		),
	},
	// Actions
	{
		n: "plus",
		g: "Actions",
		el: (
			<>
				<line x1="12" y1="5" x2="12" y2="19" />
				<line x1="5" y1="12" x2="19" y2="12" />
			</>
		),
	},
	{
		n: "minus",
		g: "Actions",
		el: (
			<>
				<line x1="5" y1="12" x2="19" y2="12" />
			</>
		),
	},
	{
		n: "check",
		g: "Actions",
		el: (
			<>
				<polyline points="20 6 9 17 4 12" />
			</>
		),
	},
	{
		n: "x",
		g: "Actions",
		el: (
			<>
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</>
		),
	},
	{
		n: "edit",
		g: "Actions",
		el: (
			<>
				<path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
			</>
		),
	},
	{
		n: "trash",
		g: "Actions",
		el: (
			<>
				<polyline points="3 6 5 6 21 6" />
				<path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
				<path d="M10 11v6M14 11v6" />
			</>
		),
	},
	{
		n: "save",
		g: "Actions",
		el: (
			<>
				<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
				<polyline points="17 21 17 13 7 13 7 21" />
				<polyline points="7 3 7 8 15 8" />
			</>
		),
	},
	{
		n: "copy",
		g: "Actions",
		el: (
			<>
				<rect x="9" y="9" width="13" height="13" rx="2" />
				<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
			</>
		),
	},
	{
		n: "paste",
		g: "Actions",
		el: (
			<>
				<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
				<rect x="8" y="2" width="8" height="4" rx="1" />
			</>
		),
	},
	{
		n: "duplicate",
		g: "Actions",
		el: (
			<>
				<rect x="3" y="3" width="13" height="13" rx="2" />
				<path d="M8 8h13v13H8" />
			</>
		),
	},
	{
		n: "download",
		g: "Actions",
		el: (
			<>
				<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
				<polyline points="7 10 12 15 17 10" />
				<line x1="12" y1="15" x2="12" y2="3" />
			</>
		),
	},
	{
		n: "upload",
		g: "Actions",
		el: (
			<>
				<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
				<polyline points="17 8 12 3 7 8" />
				<line x1="12" y1="3" x2="12" y2="15" />
			</>
		),
	},
	{
		n: "send",
		g: "Actions",
		el: (
			<>
				<line x1="22" y1="2" x2="11" y2="13" />
				<polygon points="22 2 15 22 11 13 2 9 22 2" />
			</>
		),
	},
	{
		n: "share",
		g: "Actions",
		el: (
			<>
				<circle cx="18" cy="5" r="3" />
				<circle cx="6" cy="12" r="3" />
				<circle cx="18" cy="19" r="3" />
				<line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
				<line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
			</>
		),
	},
	{
		n: "link",
		g: "Actions",
		el: (
			<>
				<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
				<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
			</>
		),
	},
	{
		n: "unlink",
		g: "Actions",
		el: (
			<>
				<path d="M18.84 12.25l1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
				<path d="M5.16 11.75l-1.72 1.71a5 5 0 0 0 7.07 7.07l1.72-1.71" />
				<line x1="8" y1="2" x2="8" y2="5" />
				<line x1="2" y1="8" x2="5" y2="8" />
				<line x1="16" y1="19" x2="16" y2="22" />
				<line x1="19" y1="16" x2="22" y2="16" />
			</>
		),
	},
	{
		n: "refresh",
		g: "Actions",
		el: (
			<>
				<polyline points="23 4 23 10 17 10" />
				<polyline points="1 20 1 14 7 14" />
				<path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
			</>
		),
	},
	{
		n: "rotate",
		g: "Actions",
		el: (
			<>
				<polyline points="1 4 1 10 7 10" />
				<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
			</>
		),
	},
	{
		n: "undo",
		g: "Actions",
		el: (
			<>
				<path d="M3 7v6h6" />
				<path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
			</>
		),
	},
	{
		n: "redo",
		g: "Actions",
		el: (
			<>
				<path d="M21 7v6h-6" />
				<path d="M3 17a9 9 0 0 1 15-6.7L21 13" />
			</>
		),
	},
	{
		n: "play",
		g: "Actions",
		el: (
			<>
				<polygon points="5 3 19 12 5 21 5 3" />
			</>
		),
	},
	{
		n: "pause",
		g: "Actions",
		el: (
			<>
				<rect x="6" y="4" width="4" height="16" />
				<rect x="14" y="4" width="4" height="16" />
			</>
		),
	},
	{
		n: "stop",
		g: "Actions",
		el: (
			<>
				<rect x="5" y="5" width="14" height="14" rx="1" />
			</>
		),
	},
	{
		n: "skip-fwd",
		g: "Actions",
		el: (
			<>
				<polygon points="5 4 15 12 5 20 5 4" />
				<line x1="19" y1="5" x2="19" y2="19" />
			</>
		),
	},
	// Communication
	{
		n: "mail",
		g: "Communication",
		el: (
			<>
				<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
				<polyline points="22,6 12,13 2,6" />
			</>
		),
	},
	{
		n: "mail-open",
		g: "Communication",
		el: (
			<>
				<path d="M21 19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10l9-7 9 7z" />
				<polyline points="3 10 12 17 21 10" />
			</>
		),
	},
	{
		n: "message",
		g: "Communication",
		el: (
			<>
				<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
			</>
		),
	},
	{
		n: "chat",
		g: "Communication",
		el: (
			<>
				<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
			</>
		),
	},
	{
		n: "phone",
		g: "Communication",
		el: (
			<>
				<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
			</>
		),
	},
	{
		n: "video",
		g: "Communication",
		el: (
			<>
				<polygon points="23 7 16 12 23 17 23 7" />
				<rect x="1" y="5" width="15" height="14" rx="2" />
			</>
		),
	},
	{
		n: "mic",
		g: "Communication",
		el: (
			<>
				<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
				<path d="M19 10v2a7 7 0 0 1-14 0v-2" />
				<line x1="12" y1="19" x2="12" y2="23" />
			</>
		),
	},
	{
		n: "mic-off",
		g: "Communication",
		el: (
			<>
				<line x1="1" y1="1" x2="23" y2="23" />
				<path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
				<path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
				<line x1="12" y1="19" x2="12" y2="23" />
			</>
		),
	},
	{
		n: "at",
		g: "Communication",
		el: (
			<>
				<circle cx="12" cy="12" r="4" />
				<path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
			</>
		),
	},
	{
		n: "inbox",
		g: "Communication",
		el: (
			<>
				<polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
				<path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
			</>
		),
	},
	// Files
	{
		n: "file",
		g: "Files",
		el: (
			<>
				<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
				<polyline points="14 2 14 8 20 8" />
			</>
		),
	},
	{
		n: "file-text",
		g: "Files",
		el: (
			<>
				<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
				<polyline points="14 2 14 8 20 8" />
				<line x1="16" y1="13" x2="8" y2="13" />
				<line x1="16" y1="17" x2="8" y2="17" />
				<polyline points="10 9 9 9 8 9" />
			</>
		),
	},
	{
		n: "folder",
		g: "Files",
		el: (
			<>
				<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
			</>
		),
	},
	{
		n: "folder-open",
		g: "Files",
		el: (
			<>
				<path d="M6 4h-2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-9l-2-2H6z" />
			</>
		),
	},
	{
		n: "archive",
		g: "Files",
		el: (
			<>
				<polyline points="21 8 21 21 3 21 3 8" />
				<rect x="1" y="3" width="22" height="5" />
				<line x1="10" y1="12" x2="14" y2="12" />
			</>
		),
	},
	{
		n: "paperclip",
		g: "Files",
		el: (
			<>
				<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
			</>
		),
	},
	{
		n: "image",
		g: "Files",
		el: (
			<>
				<rect x="3" y="3" width="18" height="18" rx="2" />
				<circle cx="8.5" cy="8.5" r="1.5" />
				<polyline points="21 15 16 10 5 21" />
			</>
		),
	},
	{
		n: "video-file",
		g: "Files",
		el: (
			<>
				<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
				<polygon points="10 11 15 14.5 10 18 10 11" />
			</>
		),
	},
	// Status
	{
		n: "check-circle",
		g: "Status",
		el: (
			<>
				<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
				<polyline points="22 4 12 14.01 9 11.01" />
			</>
		),
	},
	{
		n: "x-circle",
		g: "Status",
		el: (
			<>
				<circle cx="12" cy="12" r="10" />
				<line x1="15" y1="9" x2="9" y2="15" />
				<line x1="9" y1="9" x2="15" y2="15" />
			</>
		),
	},
	{
		n: "alert-circle",
		g: "Status",
		el: (
			<>
				<circle cx="12" cy="12" r="10" />
				<line x1="12" y1="8" x2="12" y2="12" />
				<line x1="12" y1="16" x2="12.01" y2="16" />
			</>
		),
	},
	{
		n: "alert-triangle",
		g: "Status",
		el: (
			<>
				<path d="M10.29 3.86L1.82 18a2 2 0 002 3h16.94a2 2 0 002-3L13.71 3.86a2 2 0 00-3.42 0z" />
				<line x1="12" y1="9" x2="12" y2="13" />
				<line x1="12" y1="17" x2="12.01" y2="17" />
			</>
		),
	},
	{
		n: "info",
		g: "Status",
		el: (
			<>
				<circle cx="12" cy="12" r="10" />
				<line x1="12" y1="16" x2="12" y2="12" />
				<line x1="12" y1="8" x2="12.01" y2="8" />
			</>
		),
	},
	{
		n: "help-circle",
		g: "Status",
		el: (
			<>
				<circle cx="12" cy="12" r="10" />
				<path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
				<line x1="12" y1="17" x2="12.01" y2="17" />
			</>
		),
	},
	{
		n: "shield",
		g: "Status",
		el: (
			<>
				<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
			</>
		),
	},
	{
		n: "shield-check",
		g: "Status",
		el: (
			<>
				<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
				<polyline points="9 12 11 14 15 10" />
			</>
		),
	},
	{
		n: "lock",
		g: "Status",
		el: (
			<>
				<rect x="3" y="11" width="18" height="11" rx="2" />
				<path d="M7 11V7a5 5 0 0 1 10 0v4" />
			</>
		),
	},
	{
		n: "unlock",
		g: "Status",
		el: (
			<>
				<rect x="3" y="11" width="18" height="11" rx="2" />
				<path d="M7 11V7a5 5 0 0 1 9.9-1" />
			</>
		),
	},
	{
		n: "eye",
		g: "Status",
		el: (
			<>
				<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
				<circle cx="12" cy="12" r="3" />
			</>
		),
	},
	{
		n: "eye-off",
		g: "Status",
		el: (
			<>
				<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
				<line x1="1" y1="1" x2="23" y2="23" />
			</>
		),
	},
	{
		n: "wifi",
		g: "Status",
		el: (
			<>
				<path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0" />
				<line x1="12" y1="20" x2="12.01" y2="20" />
			</>
		),
	},
	{
		n: "battery",
		g: "Status",
		el: (
			<>
				<rect x="1" y="6" width="18" height="12" rx="2" />
				<line x1="23" y1="13" x2="23" y2="11" />
				<rect x="3" y="8" width="10" height="8" />
			</>
		),
	},
	// Objects
	{
		n: "user",
		g: "Objects",
		el: (
			<>
				<circle cx="12" cy="8" r="4" />
				<path d="M20 21a8 8 0 0 0-16 0" />
			</>
		),
	},
	{
		n: "users",
		g: "Objects",
		el: (
			<>
				<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
				<circle cx="9" cy="7" r="4" />
				<path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
			</>
		),
	},
	{
		n: "user-plus",
		g: "Objects",
		el: (
			<>
				<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
				<circle cx="8.5" cy="7" r="4" />
				<line x1="20" y1="8" x2="20" y2="14" />
				<line x1="23" y1="11" x2="17" y2="11" />
			</>
		),
	},
	{
		n: "briefcase",
		g: "Objects",
		el: (
			<>
				<rect x="2" y="7" width="20" height="14" rx="2" />
				<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
			</>
		),
	},
	{
		n: "building",
		g: "Objects",
		el: (
			<>
				<rect x="4" y="2" width="16" height="20" rx="2" />
				<line x1="9" y1="6" x2="9" y2="6.01" />
				<line x1="15" y1="6" x2="15" y2="6.01" />
				<line x1="9" y1="10" x2="9" y2="10.01" />
				<line x1="15" y1="10" x2="15" y2="10.01" />
				<line x1="9" y1="14" x2="9" y2="14.01" />
				<line x1="15" y1="14" x2="15" y2="14.01" />
			</>
		),
	},
	{
		n: "home-alt",
		g: "Objects",
		el: (
			<>
				<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
			</>
		),
	},
	{
		n: "globe",
		g: "Objects",
		el: (
			<>
				<circle cx="12" cy="12" r="10" />
				<line x1="2" y1="12" x2="22" y2="12" />
				<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
			</>
		),
	},
	{
		n: "gift",
		g: "Objects",
		el: (
			<>
				<polyline points="20 12 20 22 4 22 4 12" />
				<rect x="2" y="7" width="20" height="5" />
				<line x1="12" y1="22" x2="12" y2="7" />
				<path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
			</>
		),
	},
	{
		n: "gear",
		g: "Objects",
		el: (
			<>
				<circle cx="12" cy="12" r="3" />
				<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
			</>
		),
	},
	{
		n: "tool",
		g: "Objects",
		el: (
			<>
				<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
			</>
		),
	},
	// Commerce
	{
		n: "cart",
		g: "Commerce",
		el: (
			<>
				<circle cx="9" cy="21" r="1" />
				<circle cx="20" cy="21" r="1" />
				<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
			</>
		),
	},
	{
		n: "tag",
		g: "Commerce",
		el: (
			<>
				<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
				<line x1="7" y1="7" x2="7.01" y2="7" />
			</>
		),
	},
	{
		n: "credit-card",
		g: "Commerce",
		el: (
			<>
				<rect x="1" y="4" width="22" height="16" rx="2" />
				<line x1="1" y1="10" x2="23" y2="10" />
			</>
		),
	},
	{
		n: "dollar",
		g: "Commerce",
		el: (
			<>
				<line x1="12" y1="1" x2="12" y2="23" />
				<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
			</>
		),
	},
	{
		n: "percent",
		g: "Commerce",
		el: (
			<>
				<line x1="19" y1="5" x2="5" y2="19" />
				<circle cx="6.5" cy="6.5" r="2.5" />
				<circle cx="17.5" cy="17.5" r="2.5" />
			</>
		),
	},
	{
		n: "trending-up",
		g: "Commerce",
		el: (
			<>
				<polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
				<polyline points="17 6 23 6 23 12" />
			</>
		),
	},
	{
		n: "trending-down",
		g: "Commerce",
		el: (
			<>
				<polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
				<polyline points="17 18 23 18 23 12" />
			</>
		),
	},
	// Media
	{
		n: "star",
		g: "Media",
		el: (
			<>
				<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
			</>
		),
	},
	{
		n: "heart",
		g: "Media",
		el: (
			<>
				<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
			</>
		),
	},
	{
		n: "bookmark",
		g: "Media",
		el: (
			<>
				<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
			</>
		),
	},
	{
		n: "flag",
		g: "Media",
		el: (
			<>
				<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
				<line x1="4" y1="22" x2="4" y2="15" />
			</>
		),
	},
	{
		n: "thumbs-up",
		g: "Media",
		el: (
			<>
				<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
			</>
		),
	},
	{
		n: "thumbs-down",
		g: "Media",
		el: (
			<>
				<path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
			</>
		),
	},
	{
		n: "volume",
		g: "Media",
		el: (
			<>
				<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
				<path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
			</>
		),
	},
	{
		n: "volume-off",
		g: "Media",
		el: (
			<>
				<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
				<line x1="23" y1="9" x2="17" y2="15" />
				<line x1="17" y1="9" x2="23" y2="15" />
			</>
		),
	},
	{
		n: "camera",
		g: "Media",
		el: (
			<>
				<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
				<circle cx="12" cy="13" r="4" />
			</>
		),
	},
	{
		n: "film",
		g: "Media",
		el: (
			<>
				<rect x="2" y="2" width="20" height="20" rx="2.18" />
				<line x1="7" y1="2" x2="7" y2="22" />
				<line x1="17" y1="2" x2="17" y2="22" />
				<line x1="2" y1="12" x2="22" y2="12" />
				<line x1="2" y1="7" x2="7" y2="7" />
				<line x1="2" y1="17" x2="7" y2="17" />
				<line x1="17" y1="17" x2="22" y2="17" />
				<line x1="17" y1="7" x2="22" y2="7" />
			</>
		),
	},
	{
		n: "music",
		g: "Media",
		el: (
			<>
				<path d="M9 18V5l12-2v13" />
				<circle cx="6" cy="18" r="3" />
				<circle cx="18" cy="16" r="3" />
			</>
		),
	},
	// Tools
	{
		n: "search",
		g: "Tools",
		el: (
			<>
				<circle cx="11" cy="11" r="8" />
				<line x1="21" y1="21" x2="16.65" y2="16.65" />
			</>
		),
	},
	{
		n: "filter",
		g: "Tools",
		el: (
			<>
				<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
			</>
		),
	},
	{
		n: "sort",
		g: "Tools",
		el: (
			<>
				<path d="M3 6h18M3 12h12M3 18h6" />
			</>
		),
	},
	{
		n: "sliders",
		g: "Tools",
		el: (
			<>
				<line x1="4" y1="21" x2="4" y2="14" />
				<line x1="4" y1="10" x2="4" y2="3" />
				<line x1="12" y1="21" x2="12" y2="12" />
				<line x1="12" y1="8" x2="12" y2="3" />
				<line x1="20" y1="21" x2="20" y2="16" />
				<line x1="20" y1="12" x2="20" y2="3" />
				<line x1="1" y1="14" x2="7" y2="14" />
				<line x1="9" y1="8" x2="15" y2="8" />
				<line x1="17" y1="16" x2="23" y2="16" />
			</>
		),
	},
	{
		n: "settings",
		g: "Tools",
		el: (
			<>
				<circle cx="12" cy="12" r="3" />
				<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
			</>
		),
	},
	{
		n: "zap",
		g: "Tools",
		el: (
			<>
				<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
			</>
		),
	},
	{
		n: "sparkles",
		g: "Tools",
		el: (
			<>
				<path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM5 17l.7 2.3L8 20l-2.3.7L5 23l-.7-2.3L2 20l2.3-.7L5 17zM19 17l.7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17z" />
			</>
		),
	},
	{
		n: "magic",
		g: "Tools",
		el: (
			<>
				<path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M15 9h0M17.8 6.2L19 5M3 21l9-9M12.2 6.2L11 5" />
			</>
		),
	},
	{
		n: "wand",
		g: "Tools",
		el: (
			<>
				<line x1="3" y1="21" x2="21" y2="3" />
				<path d="M16 3l3 3 3-3-3-3z" />
				<circle cx="6" cy="18" r="2" />
			</>
		),
	},
	{
		n: "palette",
		g: "Tools",
		el: (
			<>
				<circle cx="12" cy="12" r="10" />
				<circle cx="8" cy="10" r="1.5" fill="currentColor" stroke="none" />
				<circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none" />
				<circle cx="16" cy="10" r="1.5" fill="currentColor" stroke="none" />
			</>
		),
	},
	{
		n: "brush",
		g: "Tools",
		el: (
			<>
				<path d="M9 11l-6 6v3h3l6-6M14 8l-3 3M21 3a2.83 2.83 0 0 0-4 0L8 12l4 4 9-9a2.83 2.83 0 0 0 0-4z" />
			</>
		),
	},
	{
		n: "pen",
		g: "Tools",
		el: (
			<>
				<path d="M12 19l7-7 3 3-7 7-3-3z" />
				<path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18z" />
				<circle cx="6.5" cy="6.5" r="1" />
			</>
		),
	},
	// Time
	{
		n: "calendar",
		g: "Time",
		el: (
			<>
				<rect x="3" y="4" width="18" height="18" rx="2" />
				<line x1="16" y1="2" x2="16" y2="6" />
				<line x1="8" y1="2" x2="8" y2="6" />
				<line x1="3" y1="10" x2="21" y2="10" />
			</>
		),
	},
	{
		n: "clock",
		g: "Time",
		el: (
			<>
				<circle cx="12" cy="12" r="10" />
				<polyline points="12 6 12 12 16 14" />
			</>
		),
	},
	{
		n: "hourglass",
		g: "Time",
		el: (
			<>
				<path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
			</>
		),
	},
	{
		n: "timer",
		g: "Time",
		el: (
			<>
				<line x1="10" y1="2" x2="14" y2="2" />
				<line x1="12" y1="14" x2="15" y2="11" />
				<circle cx="12" cy="14" r="8" />
			</>
		),
	},
	// Charts
	{
		n: "bar-chart",
		g: "Charts",
		el: (
			<>
				<line x1="12" y1="20" x2="12" y2="10" />
				<line x1="18" y1="20" x2="18" y2="4" />
				<line x1="6" y1="20" x2="6" y2="16" />
			</>
		),
	},
	{
		n: "pie-chart",
		g: "Charts",
		el: (
			<>
				<path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
				<path d="M22 12A10 10 0 0 0 12 2v10z" />
			</>
		),
	},
	{
		n: "activity",
		g: "Charts",
		el: (
			<>
				<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
			</>
		),
	},
];

function IconSetSection() {
	const [filter, setFilter] = React.useState("");
	const filtered = ICONS.filter(
		(i) => i.n.includes(filter.toLowerCase()) || i.g.toLowerCase().includes(filter.toLowerCase()),
	);
	const groups = [...new Set(filtered.map((i) => i.g))];

	return (
		<div>
			<DSSubsection title="Icon Set Reference">
				<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>
					{ICONS.length} icons across {[...new Set(ICONS.map((i) => i.g))].length} categories. 24×24
					viewBox, 2px stroke, no fills. Click any icon to copy its name.
				</p>
				<div style={{ marginBottom: 18, maxWidth: 320 }}>
					<input
						className="ds-input"
						placeholder="Search icons or categories…"
						value={filter}
						onChange={(e) => setFilter(e.target.value)}
						style={{ width: "100%" }}
					/>
				</div>

				{groups.map((g) => (
					<div key={g} style={{ marginBottom: 22 }}>
						<div
							style={{
								fontFamily: "var(--mono)",
								fontSize: 9.5,
								color: "var(--ink-3)",
								letterSpacing: ".08em",
								textTransform: "uppercase",
								marginBottom: 10,
								fontWeight: 700,
							}}
						>
							{g} · {filtered.filter((i) => i.g === g).length}
						</div>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
								gap: 8,
							}}
						>
							{filtered
								.filter((i) => i.g === g)
								.map((ic) => (
									<div
										key={ic.n}
										className="glass"
										style={{
											borderRadius: 8,
											padding: 10,
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
											gap: 8,
											cursor: "pointer",
											transition: "transform .12s",
										}}
										onClick={() => navigator.clipboard?.writeText(ic.n)}
										onMouseEnter={(e) => {
											e.currentTarget.style.transform = "translateY(-1px)";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.transform = "translateY(0)";
										}}
										title="Click to copy"
									>
										<svg
											viewBox="0 0 24 24"
											width="22"
											height="22"
											fill="none"
											stroke="var(--ink)"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											{ic.el}
										</svg>
										<div
											style={{
												fontFamily: "var(--mono)",
												fontSize: 9.5,
												color: "var(--ink-3)",
												textAlign: "center",
												lineHeight: 1.2,
											}}
										>
											{ic.n}
										</div>
									</div>
								))}
						</div>
					</div>
				))}
				<div style={{ marginTop: 14, fontSize: 11, color: "var(--ink-4)" }}>
					{filtered.length} of {ICONS.length} icons
				</div>
			</DSSubsection>
		</div>
	);
}

Object.assign(window, { ICONS, IconSetSection });
