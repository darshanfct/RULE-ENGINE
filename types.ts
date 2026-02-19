export interface NavItem {
  id: string;
  label: string;
  path: string; // specific filename/path relative to version folder
  isActive?: boolean;
  children?: NavItem[];
}

export interface TocItem {
  id: string;
  label: string;
  active?: boolean;
  level: number;
}