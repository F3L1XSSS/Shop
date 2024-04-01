import React, { createContext, useContext, useState, useEffect, useRef} from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  useEffect(() => {
    // Сохранение cartItems в localStorage при их изменении
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (book) => {
    setCartItems((prevItems) => {
      const itemExists = prevItems.find((item) => item.id === book.id);
      if (itemExists) {
        return prevItems.map((item) =>
          item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...book, quantity: 1 }];
    });
  };

  const removeFromCart = (bookId) => {
    setCartItems((prevItems) => {
      return prevItems.reduce((acc, item) => {
        if (item.id === bookId) {
          if (item.quantity === 1) return acc;
          return [...acc, { ...item, quantity: item.quantity - 1 }];
        } else {
          return [...acc, item];
        }
      }, []);
    });
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

const users = [{ username: "Admin", password: "123456789" }]; // Глобальный массив с администратором

let books = [
  // Глобальный массив книг
  {
    id: 1,
    title: "Example Book 1",
    description: "This is the first example book.",
    price: 10,
  },
];

const modalStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  width: "80%",
  maxWidth: "500px",
  position: "relative",
};

const BookList = ({ books }) => {
  const { addToCart } = useCart();

  return (
    <div style={bookListStyle}>
      {books.map((book) => (
        <div key={book.id} style={bookItemStyle}>
          <h3>{book.title}</h3>
          <p>{book.description}</p>
          <p style={{ fontWeight: "bold" }}>${book.price}</p>
          <button onClick={() => addToCart(book)} style={buttonStyle}>
            Купить
          </button>
        </div>
      ))}
    </div>
  );
};

const PaymentModal = ({ isOpen, makePayment }) => {
  if (!isOpen) return null;

  const fakePaymentData = {
    account: `paypal-${Math.floor(Math.random() * 1000000)}`,
    amount: Math.floor(Math.random() * 500) + 10,
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={paymentModalStyle}>
        <h3>Информация об оплате</h3>
        <p>Счет: {fakePaymentData.account}</p>
        <p>Сумма к оплате: ${fakePaymentData.amount}</p>
      </div>
    </div>
  );
};

const paymentModalStyle = {
  ...modalStyle,
  // дополнительные стили для модального окна оплаты, если нужно
};

const CartModal = ({ isOpen, closeCart, cartItems, removeFromCart }) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const openPaymentModal = () => {
    setIsPaymentModalOpen(true);
  };

  const makePayment = () => {
    // Здесь должен быть код для интеграции с платежной системой
    window.alert("Перенаправление на PayPal...");
    setIsPaymentModalOpen(false);
    closeCart();
  };

  if (!isOpen) return null;

  return (
    <>
      <div style={modalOverlayStyle}>
        <div style={modalStyle}>
          <h2 style={modalHeaderStyle}>Ваша корзина</h2>
          <button onClick={closeCart} style={modalCloseButtonStyle}>
            &times;
          </button>
          {cartItems.length > 0 ? (
            <ul style={modalListStyle}>
              {cartItems.map((item) => (
                <li key={item.id} style={modalListItemStyle}>
                  {item.title} - {item.quantity} шт.
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={buttonStyle}
                  >
                    Удалить
                  </button>
                  <button onClick={makePayment} style={buttonStyle}>
                    Оплатить через PayPal
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p style={modalEmptyTextStyle}>Корзина пуста</p>
          )}
          <button onClick={closeCart} style={buttonStyle}>
            Закрыть
          </button>
     
        </div>
      </div>


      {isPaymentModalOpen && (
        <PaymentModal isOpen={isPaymentModalOpen} makePayment={makePayment} />
      )}
    </>
  );
};


    //  <button onClick={openPaymentModal} style={buttonStyle}>
    //    Оплатить
    //  </button> 
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalHeaderStyle = {
  margin: "0",
  color: "#333",
};

const modalCloseButtonStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  border: "none",
  background: "none",
  fontSize: "1.5rem",
  color: "#333",
};

const modalListStyle = {
  listStyleType: "none",
  padding: 0,
};

const modalListItemStyle = {
  padding: "10px",
  borderBottom: "1px solid #ccc",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const modalEmptyTextStyle = {
  textAlign: "center",
  color: "#666",
};

/*  */
const bookListStyle = {
  padding: "20px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "20px",
  maxWidth: "800px",
  margin: "40px auto",
};

const bookItemStyle = {
  backgroundColor: "#fff",
  borderRadius: "8px",
  padding: "15px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  textAlign: "center",
};

const AuthForm = ({ onLogin, isAdmin }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    if (isLogin) {
      const user = users.find(
        (user) => user.username === username && user.password === password
      );
      if (user) {
        onLogin(user.username);
        isAdmin(username === "Admin"); // Проверка, является ли пользователь администратором
      } else {
        alert("Неверное имя пользователя или пароль");
      }
    } else {
      users.push({ username, password });
      setIsLogin(true);
      alert("Регистрация прошла успешно, пожалуйста, войдите");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>{isLogin ? "Логин" : "Регистрация"}</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", maxWidth: "300px" }}
      >
        <input
          type="text"
          name="username"
          placeholder="Имя пользователя"
          required
          style={inputStyle}
        />
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>
          {isLogin ? "Войти" : "Зарегистрироваться"}
        </button>
      </form>
      <button
        onClick={() => setIsLogin(!isLogin)}
        style={{
          ...buttonStyle,
          marginTop: "10px",
          backgroundColor: "#6c757d",
        }}
      >
        {isLogin ? "Нет аккаунта? Регистрация" : "Уже есть аккаунт? Войти"}
      </button>
    </div>
  );
};

const AdminPanel = ({ setBooksState }) => {
  // Создаем ref для каждого input
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const priceRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Используем refs для доступа к значениям полей
    const title = titleRef.current.value;
    const description = descriptionRef.current.value;
    const price = parseFloat(priceRef.current.value); // убедитесь, что пользователь ввел число

    // Проверяем, не пустые ли поля
    if (title && description && !isNaN(price)) {
      setBooksState((prevBooks) => [
        ...prevBooks,
        { id: prevBooks.length + 1, title, description, price },
      ]);
      alert("Книга добавлена");
      // Очищаем поля после добавления
      titleRef.current.value = "";
      descriptionRef.current.value = "";
      priceRef.current.value = "";
    } else {
      alert("Пожалуйста, заполните все поля и укажите корректную цену.");
    }
  };
  return (
    <div style={{ padding: "20px" }}>
      <h2>Панель администратора</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", maxWidth: "300px" }}
      >
      <input ref={titleRef} type="text" name="title" placeholder="Название книги" required style={inputStyle} />
      <textarea ref={descriptionRef} name="description" placeholder="Описание" required style={{ ...inputStyle, height: '100px' }} />
      <input ref={priceRef} type="number" name="price" placeholder="Цена" required style={inputStyle} />
        <button type="submit" style={buttonStyle}>
          Добавить книгу
        </button>
      </form>
    </div>
  );
};

const Header = ({ currentUser, isAdmin, onLogout }) => { // Добавьте removeFromCart сюда в параметры функции
  const { cartItems, removeFromCart } = useCart();
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  const toggleCartModal = () => setIsCartModalOpen(!isCartModalOpen);

  return (
    <header>
      <div className="header" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px",
          backgroundColor: "#f0f0f0",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <div>
          <Link to="/">Главная</Link> | <Link to="/auth">Авторизация</Link> | <Link to="/books">Каталог книг</Link>
          {isAdmin && " | "}
          {isAdmin && <Link to="/admin">Панель администратора</Link>}
        </div>
        <div>
          {currentUser && (
            <>
              <span>Привет, {currentUser}</span>
              <button onClick={onLogout} style={buttonStyle}>Выйти</button>
            </>
          )}
          <button style={buttonStyle} onClick={toggleCartModal}>
            Корзина ({cartItems.reduce((count, item) => count + item.quantity, 0)})
          </button>
          {/* Здесь передаем removeFromCart в CartModal */}
          <CartModal
            isOpen={isCartModalOpen}
            closeCart={toggleCartModal}
            cartItems={cartItems}
            removeFromCart={removeFromCart}
          />
        </div>
      </div>
    </header>
  );
};


const BooksCatalog = () => {
  const { addToCart } = useCart();
  const [booksState, setBooksState] = useState(books);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Каталог книг</h2>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {booksState.map((book) => (
          <li
            key={book.id}
            style={{
              marginBottom: "10px",
              borderBottom: "1px solid #ccc",
              paddingBottom: "10px",
            }}
          >
            <h3>{book.title}</h3>
            <p>{book.description}</p>
            <button onClick={() => addToCart(book)} style={buttonStyle}>
              Купить
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Footer = ({ visitorCount }) => (
  <footer
    style={{
      padding: "20px",
      backgroundColor: "#f0f0f0",
      textAlign: "center",
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      width: "100%",
      boxSizing: "border-box",
    }}
  >
    <p>© 2024 Онлайн-магазин книг. Все права защищены.</p>
    <p>Количество посетителей: {visitorCount}</p>
  </footer>
);

const App = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [booksState, setBooksState] = useState(books);
  const [visitorCount, setVisitorCount] = useState(0);
  



  useEffect(() => {
    // Имитация подсчета нового посетителя
    setVisitorCount((visitorCount) => visitorCount + 1);
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const Home = () => {
    return (
      <div style={homeStyle}>
        <h1 style={headingStyle}>Добро пожаловать на нашу главную страницу</h1>
        <p style={paragraphStyle}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit...
        </p>
        {/* Дополнительные абзацы Lorem Ipsum */}
      </div>
    );
  };

  const homeStyle = {
    padding: "40px",
    maxWidth: "800px",
    margin: "auto",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  };

  const headingStyle = {
    textAlign: "center",
    color: "#333",
  };

  const paragraphStyle = {
    textIndent: "20px",
    lineHeight: "1.6",
    color: "#666",
  };

  return (
    <CartProvider>
      <Router>
        <div
          style={{
            position: "relative",
            maxWidth: "800px",
            margin: "0 auto",
            backgroundColor: "#fff",
            minHeight: "100vh",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            padding: "0",
          }}
        >
          <Header currentUser={currentUser} isAdmin={isAdmin} onLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/auth"
              element={
                <AuthForm onLogin={setCurrentUser} isAdmin={setIsAdmin} />
              }
            />
            <Route
              path="/admin"
              element={<AdminPanel setBooksState={setBooksState} />}
            />
            <Route path="/books" element={<BookList books={booksState} />} />
            {/* Другие маршруты */}
          </Routes>
          <Footer visitorCount={visitorCount} />
        </div>
      </Router>
    </CartProvider>
  );
};

const inputStyle = {
  padding: "8px",
  marginBottom: "10px",
  borderRadius: "4px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  padding: "10px",
  border: "none",
  borderRadius: "4px",
  backgroundColor: "#007bff",
  color: "white",
  cursor: "pointer",
};

export default App;
