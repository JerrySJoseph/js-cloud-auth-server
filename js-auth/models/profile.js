//Method to create Build Profile
const buildProfile = ({
  name,
  email,
  designation,
  createdAt,
  phone,
  isVerified,
  photoUrl,
  authType
}) => {
  return {
    name,
    email,
    designation,
    createdAt,
    phone,
    isVerified,
    photoUrl,
    authType
  };
};

module.exports=buildProfile;
