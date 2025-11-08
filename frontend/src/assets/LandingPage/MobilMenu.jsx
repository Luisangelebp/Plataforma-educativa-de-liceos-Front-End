import './css/MobilMenu.css';
import { useState } from 'react';
import { Link, Links } from 'react-router-dom';

export default function MobilMenu(elementsMenu) {
    const [menuOpen, setMenuOpen] = useState(false);
    const elements_Menu = elementsMenu.elementsMenu;
    return (
        <>
            <div className="mobil-menu" onClick={() => setMenuOpen(!menuOpen)}>
                <i className="bi bi-list"></i>
            </div>
            {menuOpen && (
                <>
                    <div
                        className="overlay"
                        onClick={() => setMenuOpen(false)}
                    ></div>
                    <ul className="modalMenu">
                        {Array.isArray(elements_Menu)
                            ? elements_Menu.map((element, index) => {
                                  return (
                                      <li key={index}>
                                          <Link
                                              to={`#${element}`}
                                              onClick={() => setMenuOpen(false)}
                                              className="menu-item"
                                              reloadDocument={true}
                                          >
                                              {element}
                                          </Link>
                                      </li>
                                  );
                              })
                            : elements_Menu}
                    </ul>
                </>
            )}
        </>
    );
}
