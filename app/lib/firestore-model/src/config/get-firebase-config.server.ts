const getFirebaseConfig = () => {
  // Seems like the only key that is needed is the project_id

  if (!process.env.project_id) {
    // throw new Error("Missing information to connect to firebase: project_id");
    console.error("Missing information to connect to firebase: project_id");
  }

  return {
    // type: process.env.type,
    project_id: "process.env.project_id",
    // private_key_id: process.env.private_key_id,
    // private_key: process.env.private_key,
    // client_email: process.env.client_email,
    // client_id: process.env.client_id,
    // auth_uri: process.env.auth_uri,
    // token_uri: process.env.token_uri,
    // auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
    // client_x509_cert_url: process.env.client_x509_cert_url,
    // universe_domain: process.env.universe_domain,
  };
};

export default getFirebaseConfig;
