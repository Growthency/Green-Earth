#### 1) What is the difference between var, let, and const?
Answer: var → পুরানো style, function scope এ কাজ করে, বারবার declare করা যায়, hoisting হয়। let → নতুন style, block scope এ কাজ করে, মান change করা যায় কিন্তু redeclare করা যায় না। const → block scope এ কাজ করে, মান change করা যায় না (স্থির থাকে)।

#### 2) What is the difference between map(), forEach(), and filter()? 
Answer: map() → array ঘুরে নতুন array ফেরত দেয়। forEach() → array ঘুরে শুধু কাজ করে, কিছু ফেরত দেয় না। filter() → শর্ত (condition) মেনে নতুন ছোট array ফেরত দেয়।

#### 3) What are arrow functions in ES6?
Answer: ছোট করে function লেখার নতুন নিয়ম। ES6 এ এসেছে। this আলাদা behave করে (পুরানো function থেকে আলাদা)।

#### 4) How does destructuring assignment work in ES6?
Answer: Object বা array থেকে আলাদা আলাদা মান সহজে বের করা যায়। কোড ছোট ও পড়তে সহজ হয়।

#### 5) Explain template literals in ES6. How are they different from string concatenation?

Answer: Backtick (``) দিয়ে string লেখা হয়। ${ } এর ভেতরে variable/expression লেখা যায়। একাধিক লাইন লেখা সহজ। আগের + দিয়ে জোড়া লাগানোর থেকে সহজ।