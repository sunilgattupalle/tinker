export function ScriptCanvas() {
  return (
    <div
      className="relative flex flex-1 items-center justify-center overflow-auto bg-app-bg"
      style={{
        backgroundImage:
          "radial-gradient(circle, #d1d0cc 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <p className="pointer-events-none select-none font-display text-base text-text-secondary">
        Drag blocks here or ask Cosmo to help!
      </p>
    </div>
  );
}
