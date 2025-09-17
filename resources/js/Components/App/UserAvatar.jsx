const UserAvatar = ({ user, online = null, profile = false }) => {
  const sizeClass = profile ? "w-40 h-40" : "w-8 h-8";
  const dotSize = profile ? "w-4 h-4" : "w-2.5 h-2.5";

  const statusDot = online !== null && (
    <span
      className={`absolute bottom-0 right-0 ${dotSize} rounded-full border-2 border-white ${online ? "bg-green-500" : "bg-gray-400"
        }`}
    />
  );

  return (
    <div className={`relative ${sizeClass}`}>
      {user.avatar_url ? (
        <div className="rounded-full overflow-hidden w-full h-full">
          <img src={user.avatar_url} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="bg-gray-400 text-gray-800 rounded-full w-full h-full flex items-center justify-center text-xl font-semibold">
          {user.name.substring(0, 1)}
        </div>
      )}
      {statusDot}
    </div>
  );
};
export default UserAvatar;
