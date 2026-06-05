import { useEffect, useState, useRef } from 'react';
import styles from './MyListsPanel.module.css';

function formatDate(ts) {
  if (!ts) return '';
  const d = typeof ts === 'number' ? new Date(ts) : ts?.toDate?.() ?? new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MyListsPanel({
  open,
  onClose,
  lists,
  activeListId,
  loading,
  onSelectList,
  onDeleteList,
  onAddList,
  onOpenImport,
  onShowListInfo,
}) {
  const fileRef = useRef(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (!open) setConfirmDelete(null);
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="My Lists">
      <div className={styles.sheet}>
        <header className={styles.header}>
          <h2 className={styles.title}>My Lists</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">✕</button>
        </header>

        <p className={styles.lead}>
          Your uploaded CSV and Excel lead lists. Switch lists without re-mapping addresses on the map.
        </p>

        <div className={styles.addRow}>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls,.xlsm"
            className={styles.fileInput}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onAddList(f);
              e.target.value = '';
            }}
          />
          <button type="button" className={styles.addBtn} onClick={() => fileRef.current?.click()}>
            + Add spreadsheet
          </button>
          {onOpenImport && (
            <button type="button" className={styles.addBtnSecondary} onClick={onOpenImport}>
              Import (drop file)
            </button>
          )}
        </div>

        {loading ? (
          <p className={styles.empty}>Loading lists…</p>
        ) : lists.length === 0 ? (
          <p className={styles.empty}>No lists yet. Add a CSV or Excel file to get started.</p>
        ) : (
          <ul className={styles.list}>
            {lists.map((item) => {
              const active = item.id === activeListId;
              return (
                <li key={item.id} className={`${styles.item} ${active ? styles.itemActive : ''}`}>
                  <button
                    type="button"
                    className={styles.itemMain}
                    onClick={() => onSelectList(item.id)}
                  >
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemMeta}>
                      {item.leadCount ?? 0} leads · {formatDate(item.updatedAt)}
                    </span>
                    {item.fileName && (
                      <span className={styles.itemFile}>{item.fileName}</span>
                    )}
                  </button>
                  <div className={styles.itemActions}>
                    <button
                      type="button"
                      className={styles.infoBtn}
                      onClick={() => onShowListInfo(item)}
                      title="View spreadsheet preview"
                    >
                      Info
                    </button>
                    {confirmDelete === item.id ? (
                      <>
                        <button
                          type="button"
                          className={styles.delConfirm}
                          onClick={() => { onDeleteList(item.id); setConfirmDelete(null); }}
                        >
                          Delete
                        </button>
                        <button type="button" className={styles.delCancel} onClick={() => setConfirmDelete(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className={styles.delBtn}
                        onClick={() => setConfirmDelete(item.id)}
                        title="Delete list"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
