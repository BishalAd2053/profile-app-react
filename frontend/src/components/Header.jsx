import { useState } from 'react';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

export default function Header({ profile }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = profile.avatarUrl && !imgFailed;

  return (
    <header className="hero">
      <div className="container hero-inner">
        <div className="hero-content">
          <div className="hero-left">
            <div className="avatar">
              {showImage ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  onError={() => setImgFailed(true)}
                />
              ) : (
                profile.name?.charAt(0)
              )}
            </div>
            <div className="hero-text">
              <h1>{profile.name}</h1>
              <p className="title">{profile.title}</p>
              <p className="location">{profile.location}</p>
            </div>
          </div>
          <div className="social social-right">
            {profile.social?.github && (
              <a href={profile.social.github} target="_blank" rel="noreferrer" title="GitHub">
                <FaGithub />
              </a>
            )}
            {profile.social?.linkedin && (
              <a href={profile.social.linkedin} target="_blank" rel="noreferrer" title="LinkedIn">
                <FaLinkedin />
              </a>
            )}
            {profile.email && (
              <a href={`mailto:${profile.email}`} title="Email">
                <FaEnvelope />
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
