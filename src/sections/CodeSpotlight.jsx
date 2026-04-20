import { useState } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import SectionFrame from "../components/SectionFrame.jsx";
import "./CodeSpotlight.css";

const SNIPPETS = {
  java: {
    label: "ISD · Distributed services",
    file: "PostgresProjectRepository.java",
    code: `public class PostgresProjectRepository implements ProjectRepository {
  private final DataSource dataSource;

  public PostgresProjectRepository(DataSource dataSource) {
    this.dataSource = dataSource;
  }

  @Override
  public Optional<Project> findById(ProjectId id) {
    var sql = "SELECT id, name, status FROM projects WHERE id = ?";
    try (var conn = dataSource.getConnection();
         var stmt = conn.prepareStatement(sql)) {
      stmt.setObject(1, id.value());
      try (var rs = stmt.executeQuery()) {
        if (!rs.next()) return Optional.empty();
        return Optional.of(new Project(
          ProjectId.of(rs.getObject("id", UUID.class)),
          rs.getString("name"),
          Status.valueOf(rs.getString("status"))
        ));
      }
    } catch (SQLException e) {
      throw new RepositoryException("findById failed for " + id, e);
    }
  }
}`,
  },
  python: {
    label: "PQC Audit · Packet inspection",
    file: "handshake_inspector.py",
    code: `from dataclasses import dataclass
from scapy.all import sniff, TLS
import logging

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class TlsHandshake:
    version: str
    cipher_suite: str
    pqc_enabled: bool


def inspect(packet) -> TlsHandshake | None:
    if TLS not in packet:
        return None

    tls = packet[TLS]
    suite = tls.cipher_suite.name if hasattr(tls, "cipher_suite") else None
    pqc = suite is not None and suite.startswith(("ML-KEM", "KYBER"))

    handshake = TlsHandshake(
        version=tls.version.name,
        cipher_suite=suite or "unknown",
        pqc_enabled=pqc,
    )
    logger.info("handshake: %s", handshake)
    return handshake


if __name__ == "__main__":
    sniff(filter="tcp port 443", prn=inspect, store=False)`,
  },
  bash: {
    label: "SO-SHELL · Backup script",
    file: "secure-backup.sh",
    code: `#!/usr/bin/env bash
set -euo pipefail
IFS=$'\\n\\t'

SRC=\${1:?"usage: $0 <source-dir> <dest-dir>"}
DEST=\${2:?"usage: $0 <source-dir> <dest-dir>"}
STAMP=$(date -u +"%Y%m%dT%H%M%SZ")
ARCHIVE="$DEST/backup-$STAMP.tar.gz"

trap 'echo "[ERR] backup aborted" >&2; exit 1' ERR

echo "[INFO] packing $SRC → $ARCHIVE"
tar --create --gzip --file "$ARCHIVE" \\
    --exclude='*.tmp' --exclude='node_modules' \\
    --directory "$(dirname "$SRC")" "$(basename "$SRC")"

SHA=$(sha256sum "$ARCHIVE" | awk '{print $1}')
echo "$SHA  $(basename "$ARCHIVE")" > "$ARCHIVE.sha256"

echo "[OK] $ARCHIVE"
echo "[OK] sha256: $SHA"`,
  },
};

function highlight(code, lang) {
  const patterns = {
    java: [
      { re: /\b(public|class|implements|private|final|var|new|try|catch|throws|return|this|void|static|if|else|throw)\b/g, cls: "kw" },
      { re: /\b(String|UUID|Optional|SQLException|DataSource|ProjectId|Project|Status|ProjectRepository|PostgresProjectRepository|RepositoryException)\b/g, cls: "type" },
      { re: /"([^"\\]|\\.)*"/g, cls: "str" },
      { re: /@\w+/g, cls: "anno" },
      { re: /\/\/[^\n]*/g, cls: "com" },
    ],
    python: [
      { re: /\b(from|import|def|class|return|if|not|in|is|for|with|as|and|or|None|True|False|__main__)\b/g, cls: "kw" },
      { re: /\b(str|bool|int|float|bytes|dict|list|set|tuple|Optional|logger|None)\b/g, cls: "type" },
      { re: /@\w+/g, cls: "anno" },
      { re: /'[^']*'|"[^"]*"/g, cls: "str" },
      { re: /#[^\n]*/g, cls: "com" },
    ],
    bash: [
      { re: /\b(set|trap|echo|tar|date|sha256sum|awk|if|then|else|fi|for|do|done)\b/g, cls: "kw" },
      { re: /\$[A-Za-z_][A-Za-z0-9_]*|\$\{[^}]+\}/g, cls: "var" },
      { re: /'[^']*'|"[^"]*"/g, cls: "str" },
      { re: /#[^\n]*/g, cls: "com" },
    ],
  };

  let marked = [];
  let cursor = 0;

  const tokens = [];
  (patterns[lang] || []).forEach((p) => {
    let m;
    const re = new RegExp(p.re.source, p.re.flags);
    while ((m = re.exec(code)) !== null) {
      tokens.push({ start: m.index, end: m.index + m[0].length, text: m[0], cls: p.cls });
    }
  });
  tokens.sort((a, b) => a.start - b.start);

  const nonOverlap = [];
  tokens.forEach((t) => {
    if (nonOverlap.length === 0 || t.start >= nonOverlap[nonOverlap.length - 1].end) {
      nonOverlap.push(t);
    }
  });

  nonOverlap.forEach((t, i) => {
    if (cursor < t.start) marked.push({ text: code.slice(cursor, t.start) });
    marked.push({ text: t.text, cls: t.cls });
    cursor = t.end;
  });
  if (cursor < code.length) marked.push({ text: code.slice(cursor) });

  return marked;
}

export default function CodeSpotlight() {
  const { lang } = useI18n();
  const [active, setActive] = useState("java");
  const snippet = SNIPPETS[active];
  const marked = highlight(snippet.code, active);
  const lines = snippet.code.split("\n");

  return (
    <SectionFrame
      id="code"
      kicker={lang === "en" ? "Code style" : "Estilo de código"}
      title={lang === "en" ? "How the code reads." : "Cómo se lee el código."}
      subtitle={
        lang === "en"
          ? "Short snippets from three real repositories: distributed services (Java), TLS handshake inspection for post-quantum audit (Python), reproducible backups with integrity hash (Bash)."
          : "Fragmentos de tres repositorios reales: servicios distribuidos (Java), inspección de handshake TLS para auditoría postcuántica (Python), backups reproducibles con hash de integridad (Bash)."
      }
      className="code-section"
    >
      <div className="code-tabs" role="tablist">
        {Object.keys(SNIPPETS).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={active === k}
            className={active === k ? "is-active" : ""}
            onClick={() => setActive(k)}
          >
            <span className="code-tab-dot" />
            {SNIPPETS[k].label}
          </button>
        ))}
      </div>

      <article className="code-window">
        <header className="code-window-bar">
          <span className="code-window-dot code-window-dot-r" />
          <span className="code-window-dot code-window-dot-y" />
          <span className="code-window-dot code-window-dot-g" />
          <span className="code-window-file">{snippet.file}</span>
          <span className="code-window-lang">{active.toUpperCase()}</span>
        </header>

        <pre className="code-window-body">
          <span className="code-gutter" aria-hidden="true">
            {lines.map((_, i) => (
              <span key={i}>{String(i + 1).padStart(2, "0")}</span>
            ))}
          </span>
          <code>
            {marked.map((t, i) => (
              <span key={i} className={t.cls ? `tok-${t.cls}` : ""}>{t.text}</span>
            ))}
          </code>
        </pre>
      </article>
    </SectionFrame>
  );
}
