const axios = require("axios");
//const { createPool } = require("mysql2/promise");
require("dotenv").config();
const mysql = require("mysql2");

function copyQuery(query) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(
      process.env.MYSQL_CONNECTION_STRING
    );
    connection.query(query, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
    connection.end();
  });
}


async function insertData(val) {
  console.log(val);
  const connection = await pool.getConnection();
  try {
    let response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${val}&max_results=10&key=AIzaSyDpaFwXyH2L8HHmVw_brmCXWJL7lf6j2UQ`
    );
    let data = await response?.data?.items;
    let promises = data?.map(async (ele) => {
      let {
        title,
        author = ele.volumeInfo?.authors?.[0],
        published_date = ele.volumeInfo?.publishedDate,
        description,
        image_link = ele.volumeInfo?.imageLinks?.thumbnail,
        genre = ele.volumeInfo?.categories?.[0],
        pageCount,
      } = ele.volumeInfo;
      let randomIndex = Math.floor(Math.random() * 3);
      let admins = [100, 101, 102];
      let admin_id = admins[randomIndex];
      let ratings = (Math.random() * (5.0 - 0.0)).toFixed(2);
      let formatted_date =
        published_date !== undefined ? `${published_date}` : "2000-01-01"; //since api is giving undefined for some data
      if (formatted_date.trim().length == 4) {
        //since api is giving only year for some data
        formatted_date = formatted_date + "-01-01";
      }
      if (formatted_date.trim().length == 7) {
        //since api is giving only year and month for some data
        formatted_date = formatted_date + "-01";
      }
      description = description
        ?.replace("‘", "")
        .replace("’", "")
        .replace("“", "")
        .replace("”", "")
        .replace("'", "")
        .replace('"', ""); //now not needed think so bcoz now didnt used "${val}" insted we used ? in query
      title = title
        ?.replace("‘", "")
        .replace("’", "")
        .replace("“", "")
        .replace("”", "")
        .replace("'", "")
        .replace('"', "");
      //since the desc contains ' there is collision while inserting desc in table
      if (description?.length > 5000)
        description = description?.substring(0, 5000);
      if (!description && description === undefined)
        description = "NO description";
      if (genre === undefined) genre = "General";
      let [copyGenre] = await copyQuery(
        `SELECT genre_id FROM genres WHERE genre_name = ?`,
        [genre]
      );
      let genre_id;
      if (copyGenre?.length) {
        genre_id = copyGenre[0].genre_id;
      } else {
        await copyQuery(`INSERT INTO genres (genre_name) VALUES (?)`, [genre]);
        let [newGenre] = await copyQuery(
          `SELECT genre_id FROM genres WHERE genre_name = ?`,
          [genre]
        );
        genre_id = newGenre.genre_id;
      }
      let duplicants = await copyQuery(
        `select * from books where title=? and author=?`,
        [title, author]
      );
      if (!duplicants?.length) {
        title &&
          author &&
          image_link &&
          description !== "NO description" &&
          (await copyQuery(
            `INSERT INTO bookdb.books(title,author,rating,book_desc,pageCount,image_link,genre_id,admin_id,published_date) VALUES (?,?,?,?,?,?,?,?,?)`,
            [
              title,
              author,
              ratings,
              description,
              pageCount,
              image_link,
              genre_id,
              admin_id,
              formatted_date,
            ]
          ));
      }
    });
    await Promise.all(promises); //returns array of arrays
    await copyQuery(`WITH CTE AS (
      SELECT
          *,
          ROW_NUMBER() OVER (PARTITION BY genre_name ORDER BY genre_id) AS row_num
      FROM
          genres
  )
  DELETE FROM genres
  WHERE genre_id IN (
      SELECT genre_id
      FROM CTE
      WHERE row_num > 1
  );
  `);
    let searchedBooks = await copyQuery(
      `select * from books where title like '%${val}%'`
    );
    console.log(searchedBooks);
    return searchedBooks;
  } catch (err) {
    console.log(err);
  } finally {
    connection.release();
  }
}

const getUserBooks = async (req, res) => {
  let connection = await pool.getConnection();
  insertData("Database");
  try {
    let retriveBooks = `select * from bookdb.books; `;
    let retrieveGenre = `select g.genre_id,count(g.genre_id),g.genre_name from genres g join books b on b.genre_id=g.genre_id group by g.genre_id having count(g.genre_id)>=3;`;
    const [bookResult, genreResult] = await Promise.all([
      connection.query(retriveBooks),
      connection.query(retrieveGenre),
    ]);
    res.json({ book: bookResult, genre: genreResult[0] });
  } catch (error) {
    console.error("Error in getUserBooks:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = { getUserBooks, insertData };
