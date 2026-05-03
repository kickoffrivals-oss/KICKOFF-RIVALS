async function testAPI() {
  try {
    const res = await fetch("http://localhost:3000/api/matches/current");
    const data = await res.json();
    console.log("Matches:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("API Fetch Error:", e);
  }
}

testAPI();
