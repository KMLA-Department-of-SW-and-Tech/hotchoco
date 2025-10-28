export const boardsStyles = `
:root { --mint: #10c1a5; --text: #111827; --muted: #6b7280; --border: #e5e7eb; }

.boards { min-height: 100svh; background: #ffffff; color: var(--text); }

.boards-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: saturate(180%) blur(8px);
  border-bottom: 1px solid var(--border);
}

.container {
  --inline-padding: clamp(16px, 4vw, 24px);
  max-width: 430px;
  margin: 0 auto;
  padding-left: max(var(--inline-padding), env(safe-area-inset-left, 0px));
  padding-right: max(var(--inline-padding), env(safe-area-inset-right, 0px));
}

.header-row { display: flex; align-items: center; gap: 12px; padding-block: 12px; }
.back-btn { padding: 4px; margin-left: -4px; color: inherit; }
.title { font-size: 24px; font-weight: 700; }

.filters-row { display: flex; align-items: center; gap: 8px; padding-top: 6px; padding-bottom: 12px; }
.chips { display: flex; gap: 8px; }
.filters-row .request-link { margin-left: auto; }
.chip {
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid transparent;
}
.chip--primary { background: var(--mint); color: white; }
.chip--outline { background: white; color: #111827; border-color: #d1d5db; }

.request-row { padding-bottom: 10px; }
.request-link { font-size: 13px; color: var(--muted); text-decoration: none; }
.request-link:hover { color: #111827; }

.main { padding-top: 16px; padding-bottom: 88px; }
.section { margin-bottom: 16px; }
.section-title { font-size: 22px; font-weight: 700; margin-bottom: 12px; }

.columns { display: grid; grid-template-columns: 1fr 1fr; column-gap: 24px; align-items: start; }
.col { display: grid; row-gap: 12px; list-style: none; padding: 0; margin: 0; }
/* Fix inconsistent vertical rhythm by locking row height */
.col li { height: 32px; display: flex; align-items: center; }
.item { color: inherit; text-decoration: none; }
/* Ensure single-line items in notice columns so row heights match */
.columns .col .item {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.divider { border: none; height: 1px; background: var(--border); margin: 24px 0; }

.section-header { display: flex; align-items: center; }
.more { margin-left: auto; font-size: 13px; color: #6b7280; text-decoration: none; }
.more:hover { color: #111827; }

.fav-list { list-style: none; padding: 0; margin: 0; display: grid; row-gap: 12px; font-size: 15px; }

.tabbar {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  border-top: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: saturate(180%) blur(10px);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  box-shadow: 0 -6px 20px rgba(0,0,0,0.06);
}
.tabbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
}

.tab { position: relative; display: flex; flex-direction: column; align-items: center; gap: 0; padding: 6px 12px; font-size: 12px; color: #6b7280; text-decoration: none; }
.tab--active { color: #111827; font-weight: 600; }
.tab--underline { position: absolute; left: 50%; bottom: -4px; transform: translateX(-50%); width: 32px; height: 2px; background: #111827; }

/* Green dot on active icon */
.tab--active .icon::after { content: ""; position: absolute; top: -2px; right: -2px; width: 6px; height: 6px; border-radius: 9999px; background: var(--mint); }

.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 9999px;
  background: #10b981;
  color: white;
  font-size: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
`;

export function BoardsStyles() {
  return <style dangerouslySetInnerHTML={{ __html: boardsStyles }} />;
}
