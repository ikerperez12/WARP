import { useEffect, useState } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import "./TerminalManifest.css";

const BOOT_ES = [
  "INITIALIZING iker.os v2.1.0",
  "LOADING backend.kernel... OK",
  "LOADING linux.shell... OK",
  "LOADING docker.runtime... OK",
  "LOADING security.layer... OK",
  "BRIDGING udc.link + etsisi.upm",
  "UPLINK STABLE",
  "READY :: accepting inbound opportunities",
];
const BOOT_EN = [
  "INITIALIZING iker.os v2.1.0",
  "LOADING backend.kernel... OK",
  "LOADING linux.shell... OK",
  "LOADING docker.runtime... OK",
  "LOADING security.layer... OK",
  "BRIDGING udc.link + etsisi.upm",
  "UPLINK STABLE",
  "READY :: accepting inbound opportunities",
];

export default function TerminalManifest() {
  const { lang } = useI18n();
  const boot = lang === "en" ? BOOT_EN : BOOT_ES;
  const [rendered, setRendered] = useState([]);
  const [cursor, setCursor] = useState("▋");
  const [stats, setStats] = useState({
    lat: "43.3623",
    lng: "-8.4115",
    locale: "A Coruña",
    uplink: "0.00",
    cpu: "0",
    mem: "0x00FF88A",
  });

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setRendered((r) => {
        if (i >= boot.length) return r;
        const next = [...r, boot[i]];
        i++;
        return next;
      });
    }, 380);
    return () => clearInterval(id);
  }, [boot]);

  useEffect(() => {
    const id = setInterval(() => setCursor((c) => (c === "▋" ? " " : "▋")), 550);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setStats((s) => ({
        ...s,
        uplink: (Math.random() * 100).toFixed(2),
        cpu: (Math.random() * 100).toFixed(1),
        mem: `0x${Math.floor(Math.random() * 0xffffff)
          .toString(16)
          .toUpperCase()
          .padStart(6, "0")}A`,
      }));
    }, 800);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="terminal-manifest" aria-label="Technical identity terminal">
      <div className="terminal-grid" aria-hidden="true" />
      <div className="terminal-crosshair" aria-hidden="true">
        <span className="terminal-crosshair-ring" />
        <span className="terminal-crosshair-h" />
        <span className="terminal-crosshair-v" />
        <span className="terminal-crosshair-dot" />
      </div>

      <div className="terminal-corner terminal-corner-tl">
        <div>SYS.OP: ONLINE</div>
        <div>CPU.LOAD: {stats.cpu}%</div>
        <div>MEM.ALLOC: {stats.mem}</div>
        <div className="terminal-tag">[ TACTICAL OVERVIEW ]</div>
      </div>

      <div className="terminal-corner terminal-corner-tr">
        <div>LAT: {stats.lat}</div>
        <div>LNG: {stats.lng}</div>
        <div>LOC: {stats.locale}</div>
        <div>UPLINK: {stats.uplink}%</div>
      </div>

      <div className="terminal-center">
        <p className="terminal-center-kicker">//  WARPOD_OS // IDENTIDAD TÉCNICA</p>
        <h2 className="terminal-center-title">IKER_PEREZ.EXE</h2>
        <p className="terminal-center-sub">Backend · Sistemas · Seguridad aplicada · Automatización</p>
      </div>

      <div className="terminal-log">
        {rendered.map((line, i) => (
          <div key={i} className="terminal-log-line">
            <span className="terminal-log-prompt">{">"}</span>
            {line}
          </div>
        ))}
        <div className="terminal-log-line">
          <span className="terminal-log-prompt">$</span>
          <span className="terminal-cursor">{cursor}</span>
        </div>
      </div>

      <div className="terminal-warning" aria-hidden="true">
        DATA-ISM PROTOCOL ACTIVE
      </div>
    </section>
  );
}
