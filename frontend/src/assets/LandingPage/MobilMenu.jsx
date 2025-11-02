import './css/MobilMenu.css';
import { useState } from 'react';

export default function MobilMenu(elementsMenu) {
    const [menuOpen, setMenuOpen] = useState(false);
    const elements_Menu = elementsMenu.elementsMenu;
    return (
        <>
            <div className="mobil-menu" onClick={() => setMenuOpen(!menuOpen)}>
                <i className="bi bi-list"></i>
            </div>
            {menuOpen && (
                <div className="modalMenu" onClick={() => setMenuOpen(false)}>
                    <ul className="menu">
                        {elements_Menu.map((element, index) => {
                            return (
                                <li key={index}>
                                    <a
                                        href={`#${element}`}
                                        onClick={() => setMenuOpen(false)}
                                        className="menu-item"
                                    >
                                        {element}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </>
    );
}
