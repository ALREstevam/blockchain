# Blockchain Udemy Course

## Course Steps
1. Blockchain data structure
2. Buid a API
3. Creating a decentralized network
4. Consensus algorithm
5. Block explorer (UI)

#  What is a Blockchain?

* A ledger (registry) which is 
  * Immutable
  * Distributed



**Ledger**: a collection of financial accounts or transactions that people have made

![image-20191213181223692](notes.assets/image-20191213181223692.png)

**Immutable**: once the transaction recorded, it can't be changed.

**Distributed**: the ledge is not controlled by a single entity.

There is not a single company controlling the blockchain. It's distributed among a lot of people, each one is called a **node**. Each one has the same copy of the ledge.



# Javascript introduction



## Constructor function

```js
//Constructor function
function User(firstName, lastName, age, gender){
	// "this" refers to the object created by the constructor function
    this.firstName = firstName
	this.lastName = lastName
	this.age = age
	this.gender = gender
}

//Instance
var user1 = new User("John", "Smith", 26, "male")
```



## Prototype Object

A object that can be referenced from multiple objects so they can get the information or functionality that they want.

Data available to multiple instances of a object. 

```js
User.prototype.emailDomain = "@forumdomain.com"

user1.emailDomain // this works

User.prototype.getEmailAddress = function(){
    return this.firstName + this.lastName + this.emailDomain
}

user1.getEmailAddress() //this works

```



# Nonce

A **nonce** is a number that guarantees the legitimacy of a block.

A proof that a block was created by a legitimate way.

It can be tested via a proof of  work method.





