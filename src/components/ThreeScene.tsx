export const ThreeScene: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: "#080810",
      }}
    >
      {children}
    </div>
  );
};
