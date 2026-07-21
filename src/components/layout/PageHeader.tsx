import { Bell, Globe2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import '../../styles/shared-pages.css';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  showSearch?: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  showSearch = false,
  searchValue = '',
  searchPlaceholder = 'Tìm kiếm...',
  onSearchChange,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  return (
    <header className="gv-page-header">
      <div className="gv-page-header__copy">
        {eyebrow && <p className="gv-page-header__eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="gv-page-header__description">{description}</p>}
      </div>

      <div className="gv-page-header__actions">
        {showSearch && (
          <label className="gv-page-header__search">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={searchValue}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              onChange={(event) => onSearchChange?.(event.target.value)}
            />
          </label>
        )}
        <button type="button" className="gv-page-header__icon" aria-label="Thông báo">
          <Bell size={20} />
          <span aria-hidden="true" />
        </button>
        <button type="button" className="gv-page-header__icon gv-page-header__language" aria-label="Ngôn ngữ">
          <Globe2 size={20} />
        </button>
        <button
          type="button"
          className="gv-page-header__avatar"
          aria-label="Mở hồ sơ"
          title={user?.fullName || 'Hồ sơ'}
          onClick={() => navigate('/profile')}
        >
          <span>{user?.fullName?.trim().charAt(0).toUpperCase() || 'G'}</span>
        </button>
      </div>
    </header>
  );
}
