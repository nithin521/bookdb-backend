const axios = require("axios");
const { createPool } = require("mysql2/promise");
require("dotenv").config();

const pool = createPool({
  host: "localhost",
  user: "root",
  password: "nithin@521",
  database: "bookdb",
});

async function copyQuery(query, value) {
  let connection = await pool.getConnection();
  try {
    let [data] = await connection.query(query, value);
    return data;
  } catch (err) {
    console.log(err);
  } finally {
    connection.release();
  }
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

// What characteristic describes spyware?

// software that is installed on a user device and collects information about the user

// a network device that filters access and traffic coming into a network

// the use of stolen credentials to access private data

// an attack that slows or crashes a device or network service
// Question 2
// Which statement describes network security?

// It prioritizes data flows in order to give priority to delay-sensitive traffic.

// It supports growth over time in accordance with approved network design procedures.

// It ensures sensitive corporate data is available for authorized users.

// It synchronizes traffic flows using timestamps.
// Question 3
// Which two devices would be described as intermediary devices? (Choose two.)

// gaming console

// retail scanner

// assembly line robots

// server

// wireless LAN controller

// IPS
// Question 4
// A CLI output that says the following:  Switch1> config t             ^ % Invalid input detected at '^' marker.  The ^ is under the "f" in the word "config"

// Refer to the exhibit. An administrator is trying to configure the switch but receives the error message that is displayed in the exhibit. What is the problem?

// The administrator must connect via the console port to access global configuration mode.

// The administrator is already in global configuration mode.

// The entire command, configure terminal, must be used.

// The administrator must first enter privileged EXEC mode before issuing the command.
// Question 5
// Match the descriptions to the terms.

// Categories:

// the part of the OS that interacts directly with the device hardware
// A

// users interact with the operating system by typing commands
// B

// enables the user to interact with the operating system by pointing and clicking
// C

// the part of the operating system that interfaces with applications and the user
// D
// Options:

// shell

// CLI

// kernel

// GUI
// Question 6
// What is a user trying to determine when issuing a ping 10.1.1.1 command on a PC?

// if there is connectivity with the destination device

// what type of device is at the destination

// if the TCP/IP stack is functioning on the PC without putting traffic on the wire

// the path that traffic will take to reach the destination
// Question 7
// What is a characteristic of a switch virtual interface (SVI)?​

// An SVI is created in software and requires a configured IP address and a subnet mask in order to provide remote access to the switch.

// Although it is a virtual interface, it needs to have physical hardware on the device associated with it.

// SVIs do not require the no shutdown command to become enabled.

// SVIs come preconfigured on Cisco switches.
// Question 8
// Which two OSI model layers have the same functionality as two layers of the TCP/IP model? (Choose two.)

// physical

// data link

// session

// network

// transport
// Question 9
// Which three layers of the OSI model are comparable in function to the application layer of the TCP/IP model? (Choose three.)

// data link

// network

// transport

// presentation

// session

// application

// physical
// Question 10
// Which PDU is processed when a host computer is de-encapsulating a message at the transport layer of the TCP/IP model?

// bits

// frame

// packet

// segment
// Question 11
// What OSI physical layer term describes the measure of the transfer of bits across a medium over a given period of time?

// goodput

// throughput

// latency

// bandwidth
// Question 12
// Which two statements describe the characteristics of fiber-optic cabling? (Choose two.)

// Fiber-optic cabling has high signal loss.

// Fiber-optic cabling is primarily used as backbone cabling.

// Multimode fiber-optic cabling carries signals from multiple sending devices.

// Fiber-optic cabling does not conduct electricity.

// Fiber-optic cabling uses LEDs for single-mode cab​les and laser technology for multimode cables.
// Question 13
// Match the description with the media.

// Categories:

// coaxial
// A

// wireless
// B

// STP
// C

// optical fiber
// D
// Options:

// This type of media provides the most mobility options.

// Traditionally used for television but can now be used in a network to connect the customer location to the wiring of the customer premises.

// This type of copper media is used in industrial or similar environments where there is a lot of interference.

// This type of media is used for high transmission speed and can also transfer data over long distances.
// Question 14

// Refer to the exhibit. What is the maximum possible throughput between the PC and the server?

// 128 kb/s

// 1000 Mb/s

// 10 Mb/s

// 100 Mb/s
// Question 15
// A network team is comparing topologies for connecting on a shared media. Which physical topology is an example of a hybrid topology for a LAN?

// partial mesh

// bus

// ring

// extended star
// Question 16
// Although CSMA/CD is still a feature of Ethernet, why is it no longer necessary?

// the use of Gigabit Ethernet speeds

// the development of half-duplex switch operation

// the use of CSMA/CA

// the virtually unlimited availability of IPv6 addresses

// the use of full-duplex capable Layer 2 switches
// Question 17
// Which two acronyms represent the data link sublayers that Ethernet relies upon to operate? (Choose two.)

// SFD

// LLC

// FCS

// MAC

// CSMA
// Question 18
// What does a router do when it receives a Layer 2 frame over the network medium?

// de-encapsulates the frame

// determines the best path

// forwards the new frame appropriate to the medium of that segment of the physical network

// re-encapsulates the packet into a new frame
// Question 19
// What routing table entry has a next hop address associated with a destination network?

// directly-connected routes

// C and L source routes

// remote routes

// local routes
// Question 20
// If the default gateway is configured incorrectly on the host, what is the impact on communications?

// The host can communicate with other hosts on remote networks, but is unable to communicate with hosts on the local network.

// The host is unable to communicate on the local network.

// The host can communicate with other hosts on the local network, but is unable to communicate with hosts on remote networks.

// There is no impact on communications.
// Question 21
// Why is NAT not needed in IPv6?​

// The end-to-end connectivity problems that are caused by NAT are solved because the number of routes increases with the number of nodes that are connected to the Internet.

// The problems that are induced by NAT applications are solved because the IPv6 header improves packet handling by intermediate routers.​

// Because IPv6 has integrated security, there is no need to hide the IPv6 addresses of internal networks.​

// Any host or user can get a public IPv6 network address because the number of available IPv6 addresses is extremely large.​
// Question 22
// Which term describes a field in the IPv4 packet header that contains a unicast, multicast, or broadcast address?

// destination IPv4 address

// protocol

// header checksum

// TTL
// Question 23
// Which destination address is used in an ARP request frame?

// 0.0.0.0

// the physical address of the destination host

// 255.255.255.255

// AAAA.AAAA.AAAA

// FFFF.FFFF.FFFF
// Question 24
// The exhibit shows a network topology. PC1 and PC2are connected to the Fa0/1 and Fa0/2 ports of the SW1 switch, respectively. SW1 is connected through its Fa0/3 port to the Fa0/0 interface of the RT1 router. RT1 is connected through its Fa0/1 to the Fa0/2 port of SW2 switch. SW2 is connected through its Fa0/1 port to the PC3.

// Refer to the exhibit. PC1 issues an ARP request because it needs to send a packet to PC3. In this scenario, what will happen next?

// RT1 will send an ARP reply with the PC3 MAC address.

// RT1 will send an ARP reply with its own Fa0/1 MAC address.

// RT1 will send an ARP reply with its own Fa0/0 MAC address.

// RT1 will forward the ARP request to PC3.

// SW1 will send an ARP reply with its Fa0/1 MAC address.
// Question 25
// On the right side of the graphic, there are 4 PCs connected to a switch. PC1 connects to port 4 of the switch and has a MAC of 12-34-56-78-9A-BC. PC2 connects to port 3 of the switch and has a MAC of 12-34-56-78-9A-BD. PC3 connects to port 2 of the switch and has a MAC of 12-34-56-78-9A-BE. PC4 connects to port 1 of the switch and has a MAC of 12-34-56-78-9A-BF. On the left side of the graphic there is a MAC Address Table. Port 1 has a MAC entry of 12-34-56-78-9A-BF and port 3 has a MAC entry of 12-34-56-78-9A-BD.

// Refer to the exhibit. The exhibit shows a small switched network and the contents of the MAC address table of the switch. PC1 has sent a frame addressed to PC3. What will the switch do with the frame?

// The switch will forward the frame to all ports.

// The switch will discard the frame.

// The switch will forward the frame to all ports except port 4.

// The switch will forward the frame only to port 2.

// The switch will forward the frame only to ports 1 and 3.
// Question 26
// Floor(config)# interface gi0/1
// Floor(config-if)# description Connects to the Registrar LAN
// Floor(config-if)# ip address 192.168.235.234 255.255.255.0
// Floor(config-if)# no shutdown
// Floor(config-if)# interface gi0/0
// Floor(config-if)# description Connects to the Manager LAN
// Floor(config-if)# ip address 192.168.234.114 255.255.255.0
// Floor(config-if)# no shutdown
// Floor(config-if)# interface s0/0/0
// Floor(config-if)# description Connects to the ISP
// Floor(config-if)# ip address 10.234.235.254 255.255.255.0
// Floor(config-if)# no shutdown
// Floor(config-if)# interface s0/0/1
// Floor(config-if)# description Connects to the Head Office WAN
// Floor(config-if)# ip address 203.0.113.3 255.255.255.0
// Floor(config-if)# no shutdown
// Floor(config-if)# end

// Refer to the exhibit. A network administrator is connecting a new host to the Registrar LAN. The host needs to communicate with remote networks. What IP address would be configured as the default gateway on the new host?

// 10.234.235.254

// 192.168.234.114

// 192.168.235.1

// 203.0.113.3

// 192.168.235.234
// Question 27
// Match the command with the device mode at which the command is entered.

// Categories:

// ip address 192.168.4.4 255.255.255.0
// A

// enable
// B

// service password-encryption
// C

// login
// D

// copy running-config startup-config
// E
// Options:

// R1(config-line)#

// R1(config)#

// R1#

// R1>

// R1(config-if)#
// Question 28
// A router boots and enters setup mode. What is the reason for this?

// The IOS image is corrupt.

// Cisco IOS is missing from flash memory.

// The POST process has detected hardware failure.

// The configuration file is missing from NVRAM.
// Question 29
// What does the IP address 192.168.1.15/29 represent?

// broadcast address

// subnetwork address

// unicast address

// multicast address
// Question 30
// Given network 172.18.109.0, which subnet mask would be used if 6 host bits were available?

// 255.255.255.252

// 255.255.192.0

// 255.255.255.248

// 255.255.255.192

// 255.255.224.0
// Question 31
// Three devices are on three different subnets. Match the network address and the broadcast address with each subnet where these devices are located. Device 1: IP address 192.168.10.77/28 on subnet 1Device 2: IP address192.168.10.17/30 on subnet 2Device 3: IP address 192.168.10.35/29 on subnet 3

// Categories:

// Subnet 2 broadcast address
// A

// Subnet 1 broadcast address
// B

// Subnet 3 broadcast address
// C

// Subnet 3 network number
// D

// Subnet 1 network number
// E

// Subnet 2 network number
// F
// Options:

// 192.168.10.39

// 192.168.10.79

// 192.168.10.16

// 192.168.10.19

// 192.168.10.32

// 192.168.10.64
// Question 32
// What type of address is 198.133.219.162?

// public

// multicast

// loopback

// link-local
// Question 33
// Which is the compressed format of the IPv6 address fe80:0000:0000:0000:0220:0b3f:f0e0:0029?

// fe80::220:b3f:f0e0:29

// fe80:9ea0::2020:0:bf:e0:9290

// fe80:9ea0::2020::bf:e0:9290

// fe80:9ea:0:2200::fe0:290
// Question 34
// The graphic shows the output of the command netstat -r issued on a workstation:  C:Windowssystem32> netstat -r <output omitted>  IPv6 Route Table ======================================================= Active Routes:  If Metric Network Destination      Gateway   9    306 ::/0                     On-link   1    306 ::1/128                  On-link   9    306 2001::/32                On-link   9    306 2001:0:9d38:6ab8:30d0:115:3f57:fe4c/128                                     On-link   4    281 fe80::/64                On-link   9    306 fe80::/64                On-link   4    281 fe80::1c20:5d8b:4b44:bd40/128                                     On-link   9    306 fe80::30d0:115:3f57:fe4c/128                                     On-link   1    306 ff00::/8                 On-link   4    281 ff00::/8                 On-link   9    306 ff00::/8                 On-link =======================================================

// Refer to the exhibit. A user issues the command netstat –r on a workstation. Which IPv6 address is one of the link-local addresses of the workstation?

// ::1/128

// fe80::/64

// fe80::30d0:115:3f57:fe4c/128

// 2001:0:9d38:6ab8:30d0:115:3f57:fe4c/128
// Question 35
// What type of IPv6 address is represented by ::1/128?

// loopback

// EUI-64 generated link-local

// unspecified

// global unicast
// Question 36
// A Wireshark capture is shown with the Transmission Control Protocol section expanded. The item highlighted states Window size: 9017.

// tracing the path to a host computer on the network and the network has the IP address 127.0.0.1

// pinging a host computer that has the IP address 127.0.0.1 on the network

// checking the IP address on the network card

// testing the integrity of the TCP/IP stack on the local machine
// Question 37
// Which two ICMP messages are used by both IPv4 and IPv6 protocols? (Choose two.)​

// router solicitation

// protocol unreachable

// route redirection

// router advertisement

// neighbor solicitation
// Question 38
// Network information:
//   * local router LAN interface: 172.19.29.254 / fe80:65ab:dcc1::10
//   * local router WAN interface: 198.133.219.33 / 2001:db8:FACE:39::10
//   * remote server: 192.135.250.103

// What task might a user be trying to accomplish by using the ping 2001:db8:FACE:39::10 command?

// verifying that there is connectivity to the internet

// determining the path to reach the remote server

// creating a network performance benchmark to a server on the company intranet

// verifying that there is connectivity within the local network
// Question 39
// To which TCP port group does the port 414 belong?

// public

// private or dynamic

// well-known

// registered
// Question 40
// A Wireshark capture is shown with the Transmission Control Protocol section expanded. The item highlighted states Window size: 9017.

// Refer to the exhibit. What does the value of the window size specify?

// the total number of bits received during this TCP session

// a random number that is used in establishing a connection with the 3-way handshake

// the amount of data that can be sent before an acknowledgment is required

// the amount of data that can be sent at one time
// Question 41
// A client packet is received by a server. The packet has a destination port number of 22. What service is the client requesting?

//  DNS

//  DHCP

//  TFTP

//  SSH
// Question 42
// Which command is used to manually query a DNS server to resolve a specific host name?

// ipconfig /displaydns

// net

// tracert

// nslookup
// Question 43
// What service is provided by POP3?

// Retrieves email from the server by downloading the email to the local mail application of the client.

// Uses encryption to provide secure remote access to network devices and servers.

// Allows remote access to network devices and servers.

// An application that allows real-time chatting among remote users.
// Question 44
// Two students are working on a network design project. One student is doing the drawing, while the other student is writing the proposal. The drawing is finished and the student wants to share the folder that contains the drawing so that the other student can access the file and copy it to a USB drive. Which networking model is being used?

// point-to-point

// peer-to-peer

// client-based

// master-slave
// Question 45
// A network administrator is issuing the login block-for 180 attempts 2 within 30 command on a router. Which threat is the network administrator trying to prevent?

// an unidentified individual who is trying to access the network equipment room

// a device that is trying to inspect the traffic on a link

// a user who is trying to guess a password to access the router

// a worm that is attempting to access another part of the network
// Question 46
// What are two ways to protect a computer from malware? (Choose two.)

// Use antivirus software.

// Delete unused software.

// Defragment the hard disk.

// Keep software up to date.

// Empty the browser cache.
// Question 47
// Which statement describes the characteristics of packet-filtering and stateful firewalls as they relate to the OSI model?

// A stateful firewall can filter application layer information, whereas a packet-filtering firewall cannot filter beyond the network layer.

// A packet-filtering firewall uses session layer information to track the state of a connection, whereas a stateful firewall uses application layer information to track the state of a connection.

// A packet-filtering firewall typically can filter up to the transport layer, whereas a stateful firewall can filter up to the session layer.

// Both stateful and packet-filtering firewalls can filter at the application layer.
// Question 48
// The employees and residents of Ciscoville cannot access the Internet or any remote web-based services. IT workers quickly determine that the city firewall is being flooded with so much traffic that a breakdown of connectivity to the Internet is occurring. Which type of attack is being launched at Ciscoville?

// access

// reconnaissance

// DoS

// Trojan horse
// Question 49
// A small advertising company has a web server that provides critical business service. The company connects to the Internet through a leased line service to an ISP. Which approach best provides cost effective redundancy for the Internet connection?

// Add a connection to the Internet via a DSL line to another ISP.

// Add a second NIC to the web server.

// Add multiple connections between the switches and the edge router.

// Add another web server to prepare failover support.
// Question 50
// Which two commands could be used to check if DNS name resolution is working properly on a Windows PC? (Choose two.)

// nbtstat cisco.com

// net cisco.com

// ping cisco.com

// ipconfig /flushdns

// nslookup cisco.com
// Question 51
// Only employees connected to IPv6 interfaces are having difficulty connecting to remote networks. The analyst wants to verify that IPv6 routing has been enabled. What is the best command to use to accomplish the task?

// show running-config

// show ip nat translations

// show interfaces

// copy running-config startup-config
// Question 52
// Which two functions are performed at the LLC sublayer of the OSI Data Link Layer to facilitate Ethernet communication? (Choose two.)

// implements CSMA/CD over legacy shared half-duplex media

// places information in the Ethernet frame that identifies which network layer protocol is being encapsulated by the frame

// applies source and destination MAC addresses to Ethernet frame

// adds Ethernet control information to network protocol data

// integrates Layer 2 flows between 10 Gigabit Ethernet over fiber and 1 Gigabit Ethernet over copper
// Question 53
// Which two issues can cause both runts and giants in Ethernet networks? (Choose two.)

// a malfunctioning NIC

// electrical interference on serial interfaces

// using the incorrect cable type

// CRC errors

// half-duplex operations
// Question 54
// Two network engineers are discussing the methods used to forward frames through a switch. What is an important concept related to the cut-through method of switching?

// Fast-forward switching can be viewed as a compromise between store-and-forward switching and fragment-free switching.

// The fragment-free switching offers the lowest level of latency.

// Packets can be relayed with errors when fast-forward switching is used.

// Fragment-free switching is the typical cut-through method of switching.
// Question 55
// What happens when a switch receives a frame and the calculated CRC value is different than the value that is in the FCS field?

// The switch floods the frame to all ports except the port through which the frame arrived to notify the hosts of the error.

// The switch notifies the source of the bad frame.

// The switch places the new CRC value in the FCS field and forwards the frame.

// The switch drops the frame.
