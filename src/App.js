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

const Person = ({ name, number, id ,deleteClickHandler}) => {
  return (
    <div key={id}>
      {name} {number}
      <button onClick={deleteClickHandler}>delete</button>
    </div>
  );
};
const Persons = ({ persons, filter, setPersons }) => {
  const fileredContacts = persons.filter((person) =>
    person.name.toLowerCase().startsWith(filter.toLowerCase())
  );
  const onDeleteHandler = id =>{
    const toDeleteContact = persons.filter(contact => contact.id===id);
    const userConfirmation = window.confirm(`Are you sure you want to delete ${toDeleteContact.name}`);
    if(userConfirmation){
      personService.deleteContact(id)
      .then(response=>{
        setPersons(persons.filter(person => person.id !== id));
      })
      .catch(err=>{
        console.log("error here")
      })
    }
  }

  return (
    <div>
      {fileredContacts.map((person, key) => (
        <Person name={person.name} number={person.number} id={person.id} deleteClickHandler={()=>onDeleteHandler(person.id)}/>
      ))}
    </div>
  );
};

const Notification = ({notification})=>{
  if (notification.content===null) return null
  return(
    <div className={notification.type===1?"notificationSuccess":"notificationError"}>
      {notification.content}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newContact, setNewContact] = useState({ name: "", number: "" });
  const [filter, setFilter] = useState("");
  const [notificationMessage, setNotificationMessage] = useState({content:null, type:null})

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
        console.log("created person", createdPerson)
        setNotificationMessage(
          prevState=>(
            {
              ...prevState,
              content: `${newContact.name} added successfully!`,
              type: 1
            }
          ))
        setTimeout(()=>{
          setNotificationMessage(prevState=>(
            {
              ...prevState,
              content: null,
              type: null
            }
          ))
        }, 5000)
        setPersons((prevState) => [...prevState, createdPerson])
        setNewContact({ name: "", number: "" });
      })
      .catch(err => {
        console.log("error", err)
      })
    } else {
      const userConfirmation = window.confirm(`${userSearch.name} is already added to phonebook, replace the old number with a new one?`);
      if (userConfirmation){
        userSearch.number = newContact.number
        personService.update(userSearch.id, userSearch)
        .then(contactUpdateResponse =>{          
          // `${userSearch.name} updated successfully!`
          setNotificationMessage(prevState=>(
            {
              ...prevState,
              content: `${userSearch.name} updated successfully!`,
              type: 1
            }
          ))
          setTimeout(()=>{
            setNotificationMessage(prevState=>(
              {
                ...prevState,
                content: null,
                type: null
              }
            ))
          }, 5000)
          setNewContact({ name: "", number: "" });
        }).catch(err=>{
          setPersons(persons.filter(person=>person.id !== userSearch))
          
          setNotificationMessage(prevState=>(
            {
              ...prevState,
              content: `Information of ${userSearch.name} has already been removed from the server.`,
              type: 0
            }
          ))
          setTimeout(()=>{
            setNotificationMessage(prevState=>(
              {
                ...prevState,
                content: null,
                type: null
              }
            ))
          }, 5000)
        })
      }
    }
  };

  const onChangeSearch = (e) => {
    setFilter(e.target.value);
  };

  
  return (
    <div>
      <h2>Phonebook</h2>
      <Notification  notification={notificationMessage}/>
      <Filter onChangeSearch={onChangeSearch} filterInputValue={filter} />

      <h2>add a new</h2>
      <PersonForm
        formSubmitHandler={formSubmitHandler}
        inputHandler={inputHandler}
        newContact={newContact}
      />
      <h2>Numbers</h2>
      <Persons persons={persons} setPersons={setPersons} filter={filter} />
    </div>
  );
};

export default App;
