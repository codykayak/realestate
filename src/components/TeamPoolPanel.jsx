import { useState } from 'react';
import styles from './TeamPoolPanel.module.css';

export default function TeamPoolPanel({
  open,
  onClose,
  org,
  members,
  isTeamMode,
  error,
  onCreateOrg,
  onJoinOrg,
  onLeaveOrg,
  onUsePersonal,
}) {
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  async function handleCreate(e) {
    e.preventDefault();
    setBusy(true);
    await onCreateOrg(teamName);
    setBusy(false);
  }

  async function handleJoin(e) {
    e.preventDefault();
    setBusy(true);
    await onJoinOrg(inviteCode);
    setBusy(false);
  }

  function copyCode() {
    if (!org?.inviteCode) return;
    navigator.clipboard?.writeText(org.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Team lead pool">
      <div className={styles.sheet}>
        <header className={styles.header}>
          <h2 className={styles.title}>Team lead pool</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className={styles.body}>
          <p className={styles.lead}>
            Share one spreadsheet across agents. Everyone on the team sees the same leads in Map, Sheets, and Dialer.
          </p>

          {error && <p className={styles.error}>{error}</p>}

          {isTeamMode && org ? (
            <div className={styles.activeTeam}>
              <p className={styles.teamName}>{org.name}</p>
              <p className={styles.meta}>{members.length} member{members.length === 1 ? '' : 's'}</p>
              <div className={styles.codeRow}>
                <span className={styles.codeLabel}>Invite code</span>
                <code className={styles.code}>{org.inviteCode}</code>
                <button type="button" className={styles.copyBtn} onClick={copyCode}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <ul className={styles.memberList}>
                {members.map((m) => (
                  <li key={m.uid}>
                    <span>{m.email || m.uid.slice(0, 8)}</span>
                    <span className={styles.role}>{m.role}</span>
                  </li>
                ))}
              </ul>
              <button type="button" className={styles.secondaryBtn} onClick={onUsePersonal}>
                Switch to my personal leads
              </button>
              <button type="button" className={styles.dangerBtn} onClick={onLeaveOrg}>
                Leave team
              </button>
            </div>
          ) : (
            <>
              <form className={styles.form} onSubmit={handleCreate}>
                <h3 className={styles.sectionTitle}>Create a team</h3>
                <input
                  className={styles.input}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Macro REI acquisitions"
                />
                <button type="submit" className={styles.primaryBtn} disabled={busy}>
                  Create shared pool
                </button>
              </form>

              <form className={styles.form} onSubmit={handleJoin}>
                <h3 className={styles.sectionTitle}>Join with invite code</h3>
                <input
                  className={styles.input}
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="6-character code"
                  maxLength={8}
                />
                <button type="submit" className={styles.secondaryBtn} disabled={busy || !inviteCode.trim()}>
                  Join team
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
