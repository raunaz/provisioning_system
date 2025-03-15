const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const mongoose = require("mongoose");
const socketIo = require("socket.io");

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/provisioningDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const ProvisionSchema = new mongoose.Schema({
  serverType: String,
  params: Object,
  status: String,
  timestamp: { type: Date, default: Date.now },
});
const Provision = mongoose.model("Provision", ProvisionSchema);

app.post("/provision", async (req, res) => {
  const { serverType, ...params } = req.body;
  const playbook = serverType === "aws" ? "/opt/ansible/aws_provision.yml" : "/opt/ansible/vmware_provision.yml";

  const provision = new Provision({ serverType, params, status: "Pending" });
  await provision.save();

  exec(`ansible-playbook ${playbook} --extra-vars '${JSON.stringify(params)}'`, async (error, stdout, stderr) => {
    if (error) {
      provision.status = "Failed";
    } else {
      provision.status = "Completed";
    }
    await provision.save();
  });

  res.json({ message: "Provisioning started" });
});

app.get("/history", async (req, res) => {
  const history = await Provision.find();
  res.json(history);
});

const server = app.listen(5000, () => console.log("Server running on port 5000"));
const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("Client connected");
});
