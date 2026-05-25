import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { calculatePizzaPrice } from '../data/pizzaMenu';

const PizzaBuilder = () => {
  const { addToCart } = useCart();
  const [menu, setMenu] = useState({});
  const [selected, setSelected] = useState({ base: '', sauce: '', cheese: '' });
  const [veggies, setVeggies] = useState([]);
  const [meats, setMeats] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const steps = [
    { key: 'base', label: 'Base', title: 'Choose Base', required: true },
    { key: 'sauce', label: 'Sauce', title: 'Choose Sauce', required: true },
    { key: 'cheese', label: 'Cheese', title: 'Choose Cheese', required: true },
    { key: 'veggies', label: 'Veggies', title: 'Choose Veggies', required: false },
    { key: 'meats', label: 'Meat', title: 'Choose Meat', required: false }
  ];

  const optionPrices = {
    base: {
      'Classic Thin Crust': 30,
      'Cheese Burst': 60,
      'Pan Pizza': 40,
      'Gluten Free': 70,
      'Stuffed Crust': 80
    },
    sauce: {
      'Tomato Basil': 30,
      Barbecue: 35,
      'Garlic Ranch': 40,
      Pesto: 45,
      Buffalo: 35
    },
    cheese: {
      Mozzarella: 50,
      Cheddar: 55,
      Provolone: 60,
      Parmesan: 65,
      'Vegan Cheese': 70
    },
    veggies: 15,
    meats: 40
  };

  const optionMarks = {
    base: {
      'Classic Thin Crust': 'TC',
      'Cheese Burst': 'CB',
      'Pan Pizza': 'PP',
      'Gluten Free': 'GF',
      'Stuffed Crust': 'SC'
    },
    sauce: {
      'Tomato Basil': 'TB',
      Barbecue: 'BB',
      'Garlic Ranch': 'GR',
      Pesto: 'PE',
      Buffalo: 'BU'
    },
    cheese: {
      Mozzarella: 'MO',
      Cheddar: 'CH',
      Provolone: 'PR',
      Parmesan: 'PA',
      'Vegan Cheese': 'VG'
    },
    veggies: {
      Onion: 'ON',
      'Bell Pepper': 'BP',
      Olives: 'OL',
      Tomato: 'TO',
      Mushroom: 'MU'
    },
    meats: {
      Pepperoni: 'PE',
      Sausage: 'SA',
      Chicken: 'CH',
      Bacon: 'BA',
      Ham: 'HA'
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/orders/menu');
        setMenu(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load pizza menu');
      }
    };
    load();
  }, []);

  const price = useMemo(() => {
    return calculatePizzaPrice({ ...selected, veggies, meats });
  }, [selected, veggies, meats]);

  const currentStep = steps[activeStep];
  const canMoveNext =
    currentStep.key === 'base' ? Boolean(selected.base) :
      currentStep.key === 'sauce' ? Boolean(selected.sauce) :
        currentStep.key === 'cheese' ? Boolean(selected.cheese) :
          true;

  const handleCheckbox = (value, list, setList) => {
    if (list.includes(value)) {
      setList(list.filter(item => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const getOptionPrice = (category, name) => {
    const prices = optionPrices[category];
    return typeof prices === 'number' ? prices : prices?.[name] || 0;
  };

  const getOptionMark = (category, name) => {
    return optionMarks[category]?.[name] || name.slice(0, 2).toUpperCase();
  };

  const renderRadioGroup = (category, value) => (
    <div className="builder-option-grid">
        {menu[category]?.map(item => (
          <label key={item._id} className={`builder-option-card ${value === item.name ? 'selected' : ''} ${item.stock <= 0 ? 'disabled' : ''}`}>
            <input
              type="radio"
              name={category}
              value={item.name}
              checked={value === item.name}
              disabled={item.stock <= 0}
              onChange={() => setSelected({ ...selected, [category]: item.name })}
            />
            <span className="option-mark">{getOptionMark(category, item.name)}</span>
            <strong>{item.name}</strong>
            <small>+₹{getOptionPrice(category, item.name)}</small>
          </label>
        ))}
    </div>
  );

  const renderCheckboxGroup = (category, values, setValues) => (
    <div className="builder-option-grid">
        {menu[category]?.map(item => (
          <label key={item._id} className={`builder-option-card ${values.includes(item.name) ? 'selected' : ''} ${item.stock <= 0 ? 'disabled' : ''}`}>
            <input
              type="checkbox"
              value={item.name}
              checked={values.includes(item.name)}
              disabled={item.stock <= 0}
              onChange={() => handleCheckbox(item.name, values, setValues)}
            />
            <span className="option-mark">{getOptionMark(category, item.name)}</span>
            <strong>{item.name}</strong>
            <small>+₹{getOptionPrice(category, item.name)}</small>
          </label>
        ))}
    </div>
  );

  const addCustomPizzaToCart = () => {
    setError(null);
    if (!selected.base || !selected.sauce || !selected.cheese) {
      setError('Please select a base, sauce, and cheese.');
      return;
    }

    addToCart({
      name: 'Custom Pizza',
      base: selected.base,
      sauce: selected.sauce,
      cheese: selected.cheese,
      veggies,
      meats,
      price
    });
    setStatus('Custom pizza added to cart.');
  };

  const goNext = () => {
    setError(null);
    if (!canMoveNext) {
      setError(`Please choose a ${currentStep.label.toLowerCase()} before moving ahead.`);
      return;
    }
    setActiveStep(Math.min(activeStep + 1, steps.length - 1));
  };

  const renderActiveStep = () => {
    if (currentStep.key === 'base') return renderRadioGroup('base', selected.base);
    if (currentStep.key === 'sauce') return renderRadioGroup('sauce', selected.sauce);
    if (currentStep.key === 'cheese') return renderRadioGroup('cheese', selected.cheese);
    if (currentStep.key === 'veggies') return renderCheckboxGroup('veggies', veggies, setVeggies);
    if (currentStep.key === 'meats') return renderCheckboxGroup('meats', meats, setMeats);
    return null;
  };

  return (
    <div className="builder-page builder-page-v2">
      <section className="builder-title-block">
        <h1>Build Your Pizza</h1>
        <p>Customize every layer of your perfect pizza</p>
      </section>

      {error && <div className="error">{error}</div>}
      {status && <div className="success">{status}</div>}

      <div className="builder-progress builder-progress-v2">
        {steps.map((step, index) => (
          <button
            key={step.key}
            type="button"
            className={index === activeStep ? 'active' : index < activeStep ? 'done' : ''}
            onClick={() => setActiveStep(index)}
          >
            {index + 1} {step.label}
          </button>
        ))}
      </div>

      <div className="builder-layout">
        <div className="builder-config">
          <section className="builder-step wizard-step builder-selection-card">
            <div className="builder-step-head builder-step-head-v2">
              <h3>{currentStep.title}</h3>
              <p>{currentStep.required ? 'Required' : 'Optional'}</p>
            </div>

            {renderActiveStep()}

            <div className="wizard-actions">
              <button type="button" className="secondary-action" onClick={() => setActiveStep(Math.max(activeStep - 1, 0))} disabled={activeStep === 0}>Back</button>
              {activeStep < steps.length - 1 ? (
                <button type="button" className="primary-button" onClick={goNext}>Next</button>
              ) : (
                <button type="button" className="primary-button" onClick={addCustomPizzaToCart}>Add to cart</button>
              )}
            </div>
          </section>
        </div>

        <aside className="builder-preview-panel builder-preview-card-v2">
          <div className="preview-header">
            <h2>Your Pizza</h2>
          </div>
          <img className="builder-summary-image" src="/images/builder-pizza.png" alt="Custom pizza preview" />

          <div className="builder-summary">
            <div className="summary-line"><span>Base</span><strong className={!selected.base ? 'muted-summary' : ''}>{selected.base || 'Not selected'}</strong></div>
            <div className="summary-line"><span>Sauce</span><strong className={!selected.sauce ? 'muted-summary' : ''}>{selected.sauce || 'Not selected'}</strong></div>
            <div className="summary-line"><span>Cheese</span><strong className={!selected.cheese ? 'muted-summary' : ''}>{selected.cheese || 'Not selected'}</strong></div>
            <div className="summary-line"><span>Veggies</span><strong>{veggies.length ? veggies.join(', ') : 'None'}</strong></div>
            <div className="summary-line"><span>Meat</span><strong>{meats.length ? meats.join(', ') : 'None'}</strong></div>
            <div className="summary-total"><span>Total</span><strong>₹{price}</strong></div>
            <Link className="text-link" to="/cart">View cart</Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PizzaBuilder;
