
export interface NavbarItem {
    name: string;
    icon?: string;
    link: string;
    subItems?: NavbarItem;
}