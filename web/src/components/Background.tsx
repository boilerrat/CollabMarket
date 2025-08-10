export function Background(): React.ReactElement {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        backgroundImage:
          "linear-gradient(180deg, rgba(0,38,41,0.60), rgba(0,38,41,0.45)), radial-gradient(60rem 30rem at 110% 10%, rgba(85,220,223,0.25), transparent 60%), radial-gradient(40rem 30rem at -10% 110%, rgba(0,104,110,0.20), transparent 40%), url('/bg.png')",
        backgroundSize: "cover, 100% 100%, 100% 100%, cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}


