const Spinner = ({
  width = 4,
  height = 4,
}: {
  width?: number;
  height?: number;
}) => {
  return (
    <div
      className={`border-gray-300 h-${height} w-${width} animate-spin rounded-full border-2 border-t-blue-600`}
    />
  );
};

export default Spinner;
