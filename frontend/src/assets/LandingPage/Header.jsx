import MobilMenu from './MobilMenu';
import Menu from './Menu';
import '../../../public/logo.svg';
import '../../css/App.css';
import { useScreenWidth } from '../constans/hooks';
import { elementsMenu } from '../constans/constans';

export default function Header() {
    const screenWidth = useScreenWidth();
    return (
        <header>
            <div className="logo-container">
                <div className="logo">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <use href="../../logo.svg" width={100} height={100} />
                    </svg>
                </div>
                <div className="cenit">
                    <h1>CENIT</h1>
                    <h3>"Con Excelencia Navegaras Iluminando Tu Futuro"</h3>
                </div>
            </div>
            {screenWidth < 1024 ? (
                <MobilMenu elementsMenu={elementsMenu}></MobilMenu>
            ) : (
                <Menu elementsMenu={elementsMenu} />
            )}
        </header>
    );
}