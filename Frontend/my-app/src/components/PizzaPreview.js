import React from 'react';

const iconMap = {
  base: '◒',
  sauce: '●',
  cheese: '◐',
  veggies: '◆',
  meat: '■'
};

const PizzaPreview = ({ base, sauce, cheese, veggies = [], meats = [] }) => {
  const groups = [
    { label: 'Base', type: 'base', items: base ? [base] : [] },
    { label: 'Sauce', type: 'sauce', items: sauce ? [sauce] : [] },
    { label: 'Cheese', type: 'cheese', items: cheese ? [cheese] : [] },
    { label: 'Veggies', type: 'veggies', items: veggies },
    { label: 'Meat', type: 'meat', items: meats }
  ];

  const selectedCount = groups.reduce((count, group) => count + group.items.length, 0);

  return (
    <div className="pizza-preview">
      <div className="pizza-preview-image">
        <img src="/images/builder-pizza.png" alt="Custom pizza ingredients preview" />
        <div className="preview-badge">
          <strong>{selectedCount}</strong>
          selected
        </div>
      </div>

      <div className="ingredient-chip-groups">
        {groups.map(group => (
          <section key={group.label} className="ingredient-chip-group">
            <h3>{group.label}</h3>
            <div className="ingredient-chips">
              {group.items.length === 0 ? (
                <span className="ingredient-chip muted">Not selected</span>
              ) : (
                group.items.map(item => (
                  <span key={`${group.label}-${item}`} className={`ingredient-chip ${group.type}`}>
                    <span>{iconMap[group.type]}</span>
                    {item}
                  </span>
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default PizzaPreview;
