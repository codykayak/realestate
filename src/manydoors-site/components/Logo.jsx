import { Link } from 'react-router-dom';

const SOURCES = {
  full: '/manydoors-logo.png',
  mark: '/manydoors-logo.png',
};

export default function Logo({ variant = 'full', className = '', linked = true, homePath = '/manydoors' }) {
  const img = (
    <img
      src={SOURCES[variant] || SOURCES.full}
      alt="ManyDoors AI"
      className={className}
      draggable={false}
    />
  );

  if (!linked) return img;

  return (
    <Link to={homePath} className="inline-flex shrink-0 items-center transition hover:opacity-90">
      {img}
    </Link>
  );
}
