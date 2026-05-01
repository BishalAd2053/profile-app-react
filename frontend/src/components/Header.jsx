import { useState } from 'react';
import Hero3D from './Hero3D.jsx';

export default function Header({ profile }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = profile.avatarUrl && !imgFailed;

  return (
    <header className="hero">
      <Hero3D />
      <div className="container hero-inner">
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
        <h1>{profile.name}</h1>
        <p className="title">{profile.title}</p>
        <p className="location">{profile.location}</p>
        <div className="social">
          <a href={profile.social.github} target="_blank" rel="noreferrer">GitHub</a>
          <a href={profile.social.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={`mailto:${profile.email}`}>Email</a>
        </div>
      </div>
    </header>
  );
}
