import { useEffect, useState } from "react";
import { CARD_STORAGE_EVENT, CARD_STORAGE_KEY, loadStoredCards, readStoredCards } from "../utils/cardsStorage";
import "./SidebarCards.css";

export default function SidebarCards({ onManage }) {
  const [cards, setCards] = useState(readStoredCards);

  useEffect(() => {
    const syncCards = () => setCards(readStoredCards());
    const handleStorage = (event) => {
      if (!event.key || event.key === CARD_STORAGE_KEY) syncCards();
    };

    void loadStoredCards().then(setCards);

    window.addEventListener(CARD_STORAGE_EVENT, syncCards);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(CARD_STORAGE_EVENT, syncCards);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return (
    <div className="sidebar-cards">
      <div className="sidebar-section-hd">
        <span>Tarjetas</span>
        {onManage && (
          <button className="sidebar-add-card" onClick={onManage} title="Agregar tarjeta">
            +
          </button>
        )}
      </div>

      {cards.length === 0 ? (
        <button className="sidebar-empty-card" onClick={onManage} disabled={!onManage}>
          <span className="sidebar-empty-ico">💳</span>
          <span>{onManage ? "Agregar tarjeta" : "Sin tarjetas"}</span>
        </button>
      ) : (
        <div className="sidebar-card-list">
          {cards.map((card) => (
            <button className="sidebar-card-item" key={card.id} onClick={onManage} disabled={!onManage}>
              <span className={`sidebar-card-mark ${card.marcaClass || "generic"}`}>
                {card.marcaIcon || "💳"}
              </span>
              <span className="sidebar-card-info">
                <span className="sidebar-card-name">{card.alias}</span>
                <span className="sidebar-card-num">Termina en {card.ultimos}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
