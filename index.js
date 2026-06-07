require("dotenv").config();

const { App } = require("@slack/bolt");
const axios = require("axios");

const ORBIT_ORACLE_ANSWERS = [
  "Absolutely. The stars agree.",
  "High probability in this orbit.",
  "Reply hazy, ask after one coffee.",
  "Cosmic turbulence detected. Try again soon.",
  "Mission outcome looks promising.",
  "Not in this timeline.",
  "Yes, but keep a backup plan.",
  "The moon says no.",
  "Signal weak... but I think yes.",
  "Outcome unknown. Collect more data."
];

const SPACE_FACTS = [
  "A day on Venus is longer than a year on Venus.",
  "Neutron stars can spin hundreds of times per second.",
  "Saturn could float in water because its average density is so low.",
  "One million Earths could fit inside the Sun.",
  "The footprints on the Moon can last for millions of years."
];

const LAUNCH_STAGES = [
  "Ignition sequence started.",
  "Thrusters warming up.",
  "Orbit lock acquired.",
  "Launch complete. We have liftoff."
];

const pickRandom = (items) => items[Math.floor(Math.random() * items.length)];

const fetchNasaFallbackImage = async () => {
  const response = await axios.get("https://images-api.nasa.gov/search", {
    params: {
      q: "space",
      media_type: "image"
    },
    timeout: 10000
  });

  const items = response.data?.collection?.items || [];
  const imageItem = items.find((item) => item.links?.[0]?.href) || items[0];

  if (!imageItem?.links?.[0]?.href) {
    throw new Error("NASA image search returned no usable image");
  }

  return {
    title: imageItem.data?.[0]?.title || "NASA Image",
    url: imageItem.links[0].href,
    date: imageItem.data?.[0]?.date_created || "Unknown date",
    explanation:
      imageItem.data?.[0]?.description ||
      "NASA APOD was unavailable, so this fallback image was pulled from the NASA image library."
  };
};

const sendNasaPic = async (respond) => {
  try {
    const nasaApiKey = process.env.NASA_API_KEY || "DEMO_KEY";
    const response = await axios.get("https://api.nasa.gov/planetary/apod", {
      params: { api_key: nasaApiKey },
      timeout: 20000
    });

    const apod = response.data;
    const isVideo = apod.media_type === "video";

    await respond({
      response_type: "in_channel",
      text: `NASA APOD: ${apod.title}`,
      attachments: [
        {
          color: "#36C5F0",
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: `NASA APOD: ${apod.title}`
              }
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Date:* ${apod.date}${apod.copyright ? `\n*Credit:* ${apod.copyright}` : ""}`
              }
            },
            ...(isVideo
              ? [
                  {
                    type: "section",
                    text: {
                      type: "mrkdwn",
                      text: `This APOD is a video today.\n<${apod.url}|Open video>`
                    }
                  }
                ]
              : [
                  {
                    type: "image",
                    image_url: apod.url,
                    alt_text: apod.title
                  }
                ]),
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `${apod.explanation.slice(0, 700)}${apod.explanation.length > 700 ? "..." : ""}`
              }
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: ":sparkles: Deep space transmission complete"
                }
              ]
            }
          ]
        }
      ]
    });
  } catch (err) {
    console.error("NASA APOD fetch failed:", err.response?.status, err.response?.data || err.message);

    try {
      const fallback = await fetchNasaFallbackImage();

      await respond({
        response_type: "in_channel",
        text: `NASA image fallback: ${fallback.title}`,
        attachments: [
          {
            color: "#36C5F0",
            blocks: [
              {
                type: "header",
                text: {
                  type: "plain_text",
                  text: `NASA Image Fallback: ${fallback.title}`
                }
              },
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*Source:* NASA image library\n*Date:* ${fallback.date}`
                }
              },
              {
                type: "image",
                image_url: fallback.url,
                alt_text: fallback.title
              },
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `${fallback.explanation.slice(0, 700)}${fallback.explanation.length > 700 ? "..." : ""}`
                }
              },
              {
                type: "context",
                elements: [
                  {
                    type: "mrkdwn",
                    text: ":sparkles: APOD was unavailable, so OrbitBot switched to a NASA image fallback"
                  }
                ]
              }
            ]
          }
        ]
      });
    } catch (fallbackErr) {
      console.error("NASA fallback fetch failed:", fallbackErr.response?.status, fallbackErr.response?.data || fallbackErr.message);
      await respond({
        text:
          "NASA pics are failing upstream right now. Check `NASA_API_KEY`, then try again later.",
        response_type: "ephemeral"
      });
    }
  }
};

const sendCatFact = async (respond) => {
  try {
    const response = await axios.get("https://catfact.ninja/fact");
    await respond({
      response_type: "in_channel",
      attachments: [
        {
          color: "#FFB302",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `:cat2: *Cat Fact Transmission*\n${response.data.fact}`
              }
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: ":sparkles: Feline data packet received"
                }
              ]
            }
          ]
        }
      ]
    });
  } catch (err) {
    await respond({ text: "Failed to fetch a cat fact.", response_type: "ephemeral" });
  }
};

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

app.command("/nasapic", async ({ ack, respond }) => {
  await ack();
  await sendNasaPic(respond);
});


app.command("/apod", async ({ ack, respond }) => {
  await ack();
  await sendNasaPic(respond);
});

app.command("/orbitping", async ({ ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({
    text: `Orbit link stable. Latency: ${latency}ms`,
    attachments: [
      {
        color: "#2EB67D",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `:satellite: *Orbit link stable*\nLatency: ${latency}ms`
            }
          }
        ]
      }
    ]
  });
});

app.command("/orbitlaunch", async ({ ack, respond }) => {
  await ack();

  const launchMessage = async (stageIndex) => {
    await respond({
      response_type: "in_channel",
      text: `Orbit launch: ${LAUNCH_STAGES[stageIndex]}`,
      attachments: [
        {
          color: stageIndex < 3 ? "#ECB22E" : "#36C5F0",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `:rocket: *Orbit Launch Sequence*\n${LAUNCH_STAGES[stageIndex]}`
              }
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `Stage ${stageIndex + 1} of ${LAUNCH_STAGES.length}`
                }
              ]
            }
          ]
        }
      ]
    });
  };

  await launchMessage(0);
  setTimeout(() => launchMessage(1).catch(() => {}), 900);
  setTimeout(() => launchMessage(2).catch(() => {}), 1800);
  setTimeout(() => launchMessage(3).catch(() => {}), 2800);
});

app.command("/orbithelp", async ({ ack, respond }) => {
  await ack();
  await respond({
    text: "OrbitBot command center",
    response_type: "ephemeral",
    attachments: [
      {
        color: "#6139CC",
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "OrbitBot Command Center"
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                "• */nasapic* - NASA Astronomy Picture of the Day\n" +
                "• */orbitcatfact* - Random cat fact transmission alias\n" +
                "• */orbitoracle <question>* - Cosmic yes/no answer\n" +
                "• */orbitfact* - Quick space fact\n" +
                "• */orbitlaunch* - Multi-stage launch effect\n" +
                "• */orbitping* - Check bot responsiveness"
            }
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: ":sparkles: Try `/orbitlaunch` for the animated effect"
              }
            ]
          }
        ]
      }
    ]
  });
});

app.command("/orbitcatfact", async ({ ack, respond }) => {
  await ack();
  await sendCatFact(respond);
});

app.command("/orbitoracle", async ({ command, ack, respond }) => {
  await ack();

  const question = (command.text || "").trim();
  const oracleAnswer = pickRandom(ORBIT_ORACLE_ANSWERS);
  if (!question) {
    await respond({
      text: "Ask a question: /orbitoracle Will we ship this today?",
      response_type: "ephemeral"
    });
    return;
  }

  await respond({
    response_type: "in_channel",
    text: `Orbit Oracle: ${oracleAnswer}`,
    attachments: [
      {
        color: "#A64AC9",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                `:crystal_ball: *Question:* ${question}\n` +
                `:satellite: *Orbit Oracle:* ${oracleAnswer}`
            }
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: ":sparkles: Cosmic probability engine engaged"
              }
            ]
          }
        ]
      }
    ]
  });
});

app.command("/orbitfact", async ({ ack, respond }) => {
  await ack();
  const spaceFact = pickRandom(SPACE_FACTS);
  await respond({
    response_type: "in_channel",
    text: `Space Fact: ${spaceFact}`,
    attachments: [
      {
        color: "#1D9BF0",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `:milky_way: *Space Fact*\n${spaceFact}`
            }
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: ":sparkles: Fresh from the cosmic archive"
              }
            ]
          }
        ]
      }
    ]
  });
});

app.event("app_mention", async ({ event, say }) => {
  const text = (event.text || "").toLowerCase();
  if (text.includes("fact")) {
    await say(`:milky_way: ${pickRandom(SPACE_FACTS)}`);
    return;
  }

  await say(
    "Try `/orbithelp` for commands, `/nasapic` for NASA APOD, or ask me for a fact by mentioning `fact`."
  );
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();