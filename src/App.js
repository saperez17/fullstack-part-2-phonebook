import axios from "axios";
import { useState, useEffect } from "react";
import personService from './services/persons';
import "./styles.css";

const Filter = ({ onChangeSearch, filterInputValue }) => {
  return (
    <div>
      filter shown with{" "}
      <input onChange={onChangeSearch} value={filterInputValue} />
    </div>
  );
};

const PersonForm = ({ formSubmitHandler, inputHandler, newContact }) => {
  return (
    <form onSubmit={formSubmitHandler}>
      <div>
        name:{" "}
        <input name="name" onChange={inputHandler} value={newContact.name} />
      </div>
      <div>
        number:{" "}
        <input
          name="number"
          onChange={inputHandler}
          value={newContact.number}
        />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  );
};

const Person = ({ name, number, id }) => {
  return (
    <div key={id}>
      {name} {number}
    </div>
  );
};
const Persons = ({ contacts }) => {
  return (
    <div>
      {contacts.map((person, key) => (
        <Person name={person.name} number={person.number} id={person.id}/>
      ))}
    </div>
  );
};
const App = () => {
  const [persons, setPersons] = useState([
  ]);
  const [newContact, setNewContact] = useState({ name: "", number: "" });
  const [filter, setFilter] = useState("");

  useEffect(()=>{
    personService.getAll()
    .then(initialPersons=>{
      setPersons(initialPersons)
    })
    .catch(error =>{
      console.log("Something went wrong")
    })
  }, [])
  const inputHandler = (e) => {
    setNewContact((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  const formSubmitHandler = (e) => {
    e.preventDefault();
    let userSearch = persons.find((person) => person.name === newContact.name);
    if (!userSearch) {
      personService.create(newContact)
      .then(createdPerson =>{
        setPersons((prevState) => [...prevState, newContact])
        setNewContact({ name: "", number: "" });
      })
    } else alert(`${newContact.name} is already added to phonebook`);
  };

  const onChangeSearch = (e) => {
    setFilter(e.target.value);
  };

  const fileredContacts = persons.filter((person) =>
    person.name.toLowerCase().startsWith(filter.toLowerCase())
  );
  return (
    <div>
      <h2>Phonebook</h2>

      <Filter onChangeSearch={onChangeSearch} filterInputValue={filter} />

      <h2>add a new</h2>
      <PersonForm
        formSubmitHandler={formSubmitHandler}
        inputHandler={inputHandler}
        newContact={newContact}
      />
      <h2>Numbers</h2>
      <Persons contacts={fileredContacts} />
    </div>
  );
};

export default App;
