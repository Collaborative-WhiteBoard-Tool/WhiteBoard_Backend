export interface ShareBoardEmailData {
    recipientEmail: string;
    recipientName: string;
    senderName: string;
    boardTitle: string;
    boardId: string;
    role: 'EDITOR' | 'VIEWER';
    appUrl: string;
}

export const generateShareBoardEmail = (data: ShareBoardEmailData) => {
 
    const baseUrl = data.appUrl.split(',')[0].trim();
    const boardUrl = `${baseUrl}/whiteboard/${data.boardId}`;
    const roleColor = data.role === 'EDITOR' ? '#7c3aed' : '#0ea5e9';
    const roleLabel = data.role === 'EDITOR' ? '✏️ Editor' : '👁️ Viewer';

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="margin:0;padding:0;background:#eef2ff;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:60px 0;background:linear-gradient(135deg,#eef2ff,#fdf4ff);">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" 
style="background:#ffffff;border-radius:20px;overflow:hidden;
box-shadow:0 20px 60px rgba(124,58,237,0.15);">

<!-- HEADER -->
<tr>
<td style="
background:linear-gradient(135deg,#6d28d9,#9333ea,#ec4899);
padding:48px 40px;
text-align:center;
">

<div style="
display:inline-block;
background:rgba(255,255,255,0.15);
backdrop-filter:blur(8px);
padding:14px 28px;
border-radius:999px;
font-size:13px;
letter-spacing:1.5px;
color:#fff;
font-weight:600;
text-transform:uppercase;
">
Collaborative Workspace
</div>

<h1 style="
margin:22px 0 0;
color:#ffffff;
font-size:30px;
font-weight:800;
letter-spacing:-0.5px;
">
🎨 WhiteBoard
</h1>

<p style="
margin:10px 0 0;
color:rgba(255,255,255,0.85);
font-size:15px;
">
Design. Collaborate. Create.
</p>

</td>
</tr>

<!-- BODY -->
<tr>
<td style="padding:50px 50px 40px;">

<p style="margin:0 0 12px;font-size:16px;color:#475569;">
Hello <strong style="color:#0f172a;">${data.recipientName}</strong> 👋
</p>

<h2 style="
margin:0 0 22px;
font-size:24px;
font-weight:800;
color:#0f172a;
line-height:1.3;
">
You're invited to collaborate
</h2>

<p style="
margin:0 0 30px;
font-size:15px;
color:#64748b;
line-height:1.7;
">
<strong style="color:#7c3aed;">${data.senderName}</strong> has shared a board with you and granted access as:
</p>

<!-- ROLE BADGE -->
<div style="text-align:center;margin-bottom:34px;">
<span style="
display:inline-block;
background:linear-gradient(135deg,${roleColor},#9333ea);
color:#fff;
padding:10px 32px;
border-radius:999px;
font-size:14px;
font-weight:700;
letter-spacing:0.5px;
box-shadow:0 6px 20px rgba(124,58,237,0.3);
">
${roleLabel}
</span>
</div>

<!-- BOARD CARD -->
<div style="
background:linear-gradient(135deg,#f8fafc,#ffffff);
border:1px solid #e2e8f0;
border-radius:16px;
padding:26px;
margin-bottom:40px;
box-shadow:0 8px 30px rgba(0,0,0,0.04);
">

<p style="
margin:0 0 6px;
font-size:12px;
color:#94a3b8;
text-transform:uppercase;
letter-spacing:1.5px;
font-weight:700;
">
Board Title
</p>

<p style="
margin:0;
font-size:20px;
font-weight:800;
color:#0f172a;
">
📋 ${data.boardTitle}
</p>

</div>

<!-- CTA BUTTON -->
<div style="text-align:center;margin-bottom:36px;">
<a href="${boardUrl}" 
style="
display:inline-block;
background:linear-gradient(135deg,#7c3aed,#ec4899);
color:#ffffff;
text-decoration:none;
padding:16px 48px;
border-radius:14px;
font-size:16px;
font-weight:800;
letter-spacing:0.6px;
box-shadow:0 10px 35px rgba(124,58,237,0.4);
transition:all .3s ease;
">
🚀 Open Board
</a>
</div>

<!-- ROLE INFO -->
<div style="
background:${data.role === 'EDITOR' ? '#f3e8ff' : '#ecfeff'};
border-left:5px solid ${roleColor};
border-radius:8px;
padding:18px 20px;
">

<p style="
margin:0;
font-size:14px;
color:#475569;
line-height:1.6;
">
${
data.role === 'EDITOR'
? '✏️ As an <strong>Editor</strong>, you can modify content, draw, and collaborate in real time.'
: '👁️ As a <strong>Viewer</strong>, you can explore the board but cannot make changes.'
}
</p>

</div>

</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="
background:#f8fafc;
border-top:1px solid #e2e8f0;
padding:30px;
text-align:center;
">

<p style="
margin:0 0 8px;
font-size:12px;
color:#94a3b8;
">
If you weren't expecting this invitation, simply ignore this email.
</p>

<p style="
margin:0;
font-size:12px;
color:#cbd5e1;
">
© 2026 WhiteBoard App. All rights reserved.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>
</body>
</html>
`;

    return {
        subject: `🎨 ${data.senderName} shared "${data.boardTitle}" with you`,
        html,
    };
};