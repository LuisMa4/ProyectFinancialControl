import { useEffect, useState } from "react";
import { CARD_STORAGE_EVENT, CARD_STORAGE_KEY, loadStoredCards, readStoredCards } from "../utils/cardsStorage";
import { useI18n } from "../i18n/index.jsx";
import "./SidebarCards.css";

export default function SidebarCards({ onManage }) {
  const { t } = useI18n();
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
        <span>{t("cards.title")}</span>
        {onManage && (
          <button className="sidebar-add-card" onClick={onManage} title={t("cards.add")}>
            +
          </button>
        )}
      </div>

      {cards.length === 0 ? (
        <button className="sidebar-empty-card" onClick={onManage} disabled={!onManage}>
          <span className="sidebar-empty-ico">💳</span>
          <span>{onManage ? t("cards.add") : t("cards.none")}</span>
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
                <span className="sidebar-card-num">{t("cards.endsIn", { last4: card.ultimos })}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
