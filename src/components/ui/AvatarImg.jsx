// Renders an emoji string as text, or an http/data URL as a circular <img>.
// The parent container provides size and shape via its own CSS class.
const AvatarImg = ({ avatar, alt = "" }) => {
  const isUrl = avatar && (avatar.startsWith("http") || avatar.startsWith("data:"));
  if (isUrl) return <img src={avatar} alt={alt} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />;
  return <span>{avatar || "🎨"}</span>;
};

export default AvatarImg;
