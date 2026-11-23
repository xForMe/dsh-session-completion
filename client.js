window.__ModuleLoader__.load({
  id: '@local/dsh-session-completion',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const slot = 'sidebar.session.action';
    const id = 'local-session-completion';
    const key = 'local.sessionCompletion';
    const viewedKey = '@local/dsh-session-completion/viewed';
    // Remember the latest displayed completion per session; never compare Host time to the UI clock.
    let viewed = new Map();
    function readViewed() {
      try {
        const saved = JSON.parse(localStorage.getItem(viewedKey));
        if (!Array.isArray(saved)) return viewed;
        let next;
        for (const row of saved) {
          if (!Array.isArray(row)) continue;
          const [sid, at] = row;
          if (typeof sid !== 'string' || !Number.isSafeInteger(at) || at <= ((next ?? viewed).get(sid) ?? 0)) continue;
          (next ??= new Map(viewed)).set(sid, at);
        }
        if (next) viewed = next;
      } catch { /* Keep the in-page state if browser storage is unavailable. */ }
      return viewed;
    }
    function markViewed(items) {
      const current = readViewed();
      let next;
      for (const {sid, at} of items) {
        if (at > (current.get(sid) ?? 0)) (next ??= new Map(current)).set(sid, at);
      }
      if (!next) return current;
      viewed = next;
      try { localStorage.setItem(viewedKey, JSON.stringify([...viewed])); } catch { /* In-page fallback. */ }
      return viewed;
    }
    const en = {
      title: 'Unviewed completions', latest: 'Opening this panel marks this batch as viewed',
      empty: 'No unviewed completions.', untitled: 'New conversation',
      close: 'Close', count: 'Unviewed completions: {count}',
    };
    const zh = {
      title: '未查看的完成提醒', latest: '点开后，这一批提醒标为已查看',
      empty: '没有未查看的完成提醒。', untitled: '新会话',
      close: '关闭', count: '{count} 个未查看的会话完成提醒',
    };
    const css = `
      .dsh-sc-wrap { display:flex; align-items:center; flex:1 1 auto; min-width:0; position:relative; }
      .dsh-sc-trigger,.dsh-sc-close { display:grid; place-items:center; border:0; border-radius:8px; padding:0; color:var(--dsw-alias-label-secondary); background:transparent; cursor:pointer; }
      .dsh-sc-trigger { position:absolute; top:-47px; right:33px; z-index:4; width:32px; height:32px; -webkit-app-region:no-drag; }
      [data-windows-titlebar] .dsh-sc-trigger { top:-42px; right:1px; }
      [data-platform='darwin'] .dsh-sc-trigger { right:2px; }
      .dsh-sc-trigger:hover,.dsh-sc-close:hover,.dsh-sc-open:hover { background:var(--dsw-alias-interactive-hover); }
      .dsh-sc-trigger[aria-expanded=true],.dsh-sc-trigger:active,.dsh-sc-open:active { background:var(--dsw-alias-interactive-pressed); }
      .dsh-sc-trigger:focus-visible,.dsh-sc-close:focus-visible,.dsh-sc-open:focus-visible { outline:2px solid var(--dsw-alias-brand-primary); outline-offset:-2px; }
      .dsh-sc-trigger[data-filled] { color:var(--dsw-alias-state-success-primary); }
      .dsh-sc-badge { position:absolute; inset:0 0 auto auto; min-width:14px; height:14px; padding:0 3px; box-sizing:border-box; border:1px solid var(--dsw-alias-border-l2); border-radius:8px; color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-layer-2); font:600 10px/12px system-ui; font-variant-numeric:tabular-nums; }
      .dsh-sc-panel { position:fixed; inset:auto; box-sizing:border-box; margin:0; padding:0; width:min(340px,calc(100vw - 16px)); max-height:min(450px,calc(100dvh - 88px)); overflow:auto; overscroll-behavior:contain; border:1px solid var(--dsw-alias-border-l2); border-radius:12px; background:linear-gradient(var(--dsw-alias-bg-overlay),var(--dsw-alias-bg-overlay)),var(--dsw-alias-bg-base); color:var(--dsw-alias-label-primary); box-shadow:0 8px 24px color-mix(in srgb,var(--dsw-alias-label-primary) 15%,transparent); -webkit-app-region:no-drag; }
      .dsh-sc-heading { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; padding:12px 12px 10px 14px; border-bottom:1px solid var(--dsw-alias-border-l1); }
      .dsh-sc-heading h2 { margin:0; font-size:14px; font-weight:650; line-height:22px; }
      .dsh-sc-heading p,.dsh-sc-empty { margin:0; color:var(--dsw-alias-label-secondary); font-size:12px; line-height:18px; }
      .dsh-sc-close { width:28px; height:28px; flex:none; font:18px/1 system-ui; }
      .dsh-sc-empty { padding:16px 14px; }
      .dsh-sc-list { list-style:none; margin:0; padding:5px; }
      .dsh-sc-open { display:flex; align-items:center; gap:8px; width:100%; min-height:36px; padding:6px 8px; box-sizing:border-box; text-align:start; border:0; border-radius:6px; color:inherit; background:transparent; cursor:pointer; font:inherit; }
      .dsh-sc-open svg { flex:none; color:var(--dsw-alias-state-success-primary); }
      .dsh-sc-label { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:13px; }
      .dsh-sc-time { flex:none; white-space:nowrap; color:var(--dsw-alias-label-secondary); font-size:11px; font-variant-numeric:tabular-nums; }
      .dsh-sc-sr { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
    `;

    function unseenCompletions(items, seen) {
      return items.filter(({sid, at}) => at > (seen.get(sid) ?? 0));
    }
    function check(size) {
      return h('svg', { viewBox:'0 0 24 24', width:size, height:size, 'aria-hidden':true,
        fill:'none', stroke:'currentColor', strokeWidth:1.65, strokeLinecap:'round', strokeLinejoin:'round' },
      h('circle', { cx:12, cy:12, r:8.5 }), h('path', { d:'m8.5 12 2.3 2.4 4.8-4.8' }));
    }
    function createLayer(ctx) {
      const locale = ctx.get('locale');
      const nav = ctx.get('uiWorkspace');
      const t = locale.bind(id);
      return function CompletionLayer(props) {
        return props.wide ? h('div', {className:'dsh-sc-wrap'}, props.children, h(CompletionControl, props)) : props.children;
      };
      function CompletionControl({ useSessions, useWorkspaces }) {
        const byId = useSessions(s => s.byId);
        const ids = useSessions(s => s.ids);
        const projections = useSessions(s => s.projectionsBySession);
        const archived = useWorkspaces(s => s.archivedSessionIds);
        const language = React.useSyncExternalStore(
          React.useCallback(fn => locale.subscribe(fn), []),
          React.useCallback(() => locale.getSnapshot().active, []),
        );
        const [isOpen, setOpen] = React.useState(false);
        const [seen, setSeen] = React.useState(readViewed);
        // Retain the opening batch until dismissal, even after its badge clears.
        const [batch, setBatch] = React.useState([]);
        React.useEffect(() => {
          function sync(event) { if (event.key === viewedKey) setSeen(readViewed()); }
          window.addEventListener('storage', sync);
          return () => window.removeEventListener('storage', sync);
        }, []);
        const trigger = React.useRef(null);
        const panel = React.useRef(null);
        const panelId = React.useId();
        const items = React.useMemo(() => {
          const hidden = new Set(archived);
          const found = [];
          for (const sid of ids) {
            const row = byId[sid];
            const at = projections[sid]?.values?.[key];
            if (!row || row.running || row.blank || hidden.has(sid) || !Number.isSafeInteger(at) || at <= 0) continue;
            found.push({sid, at, title:row.title});
          }
          return found.sort((a,b) => b.at - a.at);
        }, [archived, byId, ids, projections]);
        const pending = React.useMemo(() => unseenCompletions(items, seen), [items, seen]);
        const format = React.useMemo(() => new Intl.DateTimeFormat(language, {
          month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit',
        }), [language]);
        const place = React.useCallback(() => {
          if (!trigger.current || !panel.current) return;
          const anchor = trigger.current.getBoundingClientRect();
          const width = Math.min(340, innerWidth - 16);
          panel.current.style.left = Math.max(8, Math.min(anchor.right - width, innerWidth - width - 8)) + 'px';
          panel.current.style.top = (anchor.bottom + 6) + 'px';
          panel.current.style.maxHeight = Math.min(450, Math.max(80, innerHeight - anchor.bottom - 14)) + 'px';
        }, []);
        React.useEffect(() => {
          if (!isOpen) return;
          window.addEventListener('resize', place);
          return () => window.removeEventListener('resize', place);
        }, [isOpen, place]);
        function close() { if (panel.current?.matches(':popover-open')) panel.current.hidePopover(); }
        // React 18 only attaches its non-bubbling toggle handler to <details>,
        // not to the div hosting this native popover.
        React.useLayoutEffect(() => {
          const node = panel.current;
          if (!node) return;
          function syncOpen() {
            const opened = node.matches(':popover-open');
            if (opened) {
              const openingBatch = unseenCompletions(items, readViewed());
              setBatch(openingBatch);
              setSeen(markViewed(openingBatch));
            } else {
              setBatch([]);
            }
            setOpen(opened);
          }
          node.addEventListener('toggle', syncOpen);
          return () => node.removeEventListener('toggle', syncOpen);
        }, [items]);
        const unread = pending.length;
        const shown = isOpen ? batch : pending;
        const countText = t('count', {count: unread});
        return h(React.Fragment, null,
          h('button', {
            ref:trigger, type:'button', className:'dsh-sc-trigger', title:t('title'),
            'aria-label':t('title') + (unread ? ' · ' + countText : ''),
            'aria-expanded':isOpen, 'aria-controls':panelId, 'aria-haspopup':'dialog',
            'data-filled':unread ? '' : undefined,
            popoverTarget:panelId, onClick:place,
          }, check(19), unread > 0 && h('span', {className:'dsh-sc-badge','aria-hidden':true}, unread > 99 ? '99+' : unread)),
          h('span', {className:'dsh-sc-sr', role:'status', 'aria-atomic':true}, unread ? countText : ''),
          h('div', {
            id:panelId, ref:panel, popover:'auto', role:'dialog', className:'dsh-sc-panel',
            'aria-labelledby':panelId+'-title',
          },
          h('header', {className:'dsh-sc-heading'},
            h('div', null, h('h2', {id:panelId+'-title'}, t('title')), h('p', null, t('latest'))),
            h('button', {type:'button', className:'dsh-sc-close', 'aria-label':t('close'), onClick:close}, '×')),
          shown.length === 0 ? h('p', {className:'dsh-sc-empty'}, t('empty')) :
            h('ul', {className:'dsh-sc-list'}, ...shown.map(({sid, at, title}) => h('li', {key:sid},
              h('button', {type:'button', className:'dsh-sc-open', title:title || t('untitled'),
                onClick:() => { close(); nav.openSession(sid); }}, check(15),
              h('span', {className:'dsh-sc-label'}, title || t('untitled')),
              h('time', {className:'dsh-sc-time', dateTime:new Date(at).toISOString()}, format.format(at))),
            ))),
          ),
        );
      }
    }
    return {
      inject:['slots','locale','uiWorkspace'],
      apply(ctx) {
        const locale = ctx.get('locale');
        const slots = ctx.get('slots');
        if (!locale || !slots || !ctx.get('uiWorkspace')) return;
        ctx.effect(() => locale.register(id, 'en', en));
        ctx.effect(() => locale.register(id, 'zh', zh));
        const Layer = createLayer(ctx);
        slots.inject(slot, () => slots.register({name:slot, id}, props =>
          h(React.Fragment, null, h('style', null, css), h(Layer, props))));
      },
    };
  },
});
