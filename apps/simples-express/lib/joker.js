async function fetchJoke() {
  const res = await fetch("https://icanhazdadjoke.com/", {
    headers: { Accept: "application/json" },
  });

  if (res.status != 200) throw new Error("Invalid request")

  const data = await res.json();
  return data.joke
}

module.exports = { fetchJoke }