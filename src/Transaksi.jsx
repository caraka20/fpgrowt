import axios from "axios";
import React, { useEffect, useState } from "react";
// import React from 'react';
import Tree from "react-d3-tree";
const fpgrowth = require('node-fpgrowth');

const Transaksi = () => {
  const [data, setData] = useState(null);
  const [cartt, setCartt] = useState({});
  const [datas, setDatas] = useState(null);

  const getData = async () => {
    const data = await axios.get("http://localhost:3004/transaksi");
    setData(data.data);
  };

  function createNode(name, count, parent) {
    return {
      name: name,
      count: count,
      parent: parent,
      children: {},
    };
  }

  function createFPTree() {
    return {
      root: createNode(null, 0, null),
      headerTable: {},
    };
  }

  function addTransaction(fpTree, transaction, count = 1) {
    let currentNode = fpTree.root;

    for (const item of transaction) {
      if (currentNode.children[item]) {
        currentNode.children[item].count += count;
      } else {
        const newNode = createNode(item, count, currentNode);
        currentNode.children[item] = newNode;

        if (fpTree.headerTable[item]) {
          let lastNode = fpTree.headerTable[item];
          while (lastNode.link) {
            lastNode = lastNode.link;
          }
          lastNode.link = newNode;
        } else {
          fpTree.headerTable[item] = newNode;
        }
      }

      currentNode = currentNode.children[item];
    }
  }

  useEffect(() => {
    getData();
  }, []);

// ...
useEffect(() => {
  if (data) {
    const fpTree = createFPTree();

    data.forEach((item) => {
      const key = `${item["Tahun/Bulan"]} - ${item["Produk"]}`;
      const total = item["Earphone"] + item["Charger"] + item["Case"];

      if (total > 0) {
        const p = {
          Earphone: (item["Earphone"] / total) * 100,
          Charger: (item["Charger"] / total) * 100,
          Case: (item["Case"] / total) * 100,
        };
        const orderedTransaction = Object.keys(p).sort((a, b) => p[b] - p[a]);
        addTransaction(fpTree, orderedTransaction, 1);
      }
    });

    const transformNode = (node) => {
      return {
        name: node.name,
        children: Object.values(node.children).map(transformNode),
      };
    };

    const transformedData = {
      name: fpTree.root.name,
      children: Object.values(fpTree.root.children).map(transformNode),
    };

    setCartt(transformedData);
  }
}, [data]);
// ...


  //   const data = /* Data transaksi disertakan di sini */;

  function hitungProdukTerbanyak(data) {
    const produkTerbanyak = {};

    data?.forEach((transaksi) => {
      const tahunBulan = transaksi["Tahun/Bulan"];
      const produk = transaksi["Produk"];
      const jumlah = transaksi["Jumlah"];

      if (!produkTerbanyak[tahunBulan]) {
        produkTerbanyak[tahunBulan] = {};
      }

      if (!produkTerbanyak[tahunBulan][produk]) {
        produkTerbanyak[tahunBulan][produk] = 0;
      }

      produkTerbanyak[tahunBulan][produk] += jumlah;
    });

    const hasil = [];

    for (const tahunBulan in produkTerbanyak) {
      const produkBulan = [];

      for (const produk in produkTerbanyak[tahunBulan]) {
        produkBulan.push({
          Produk: produk,
          Jumlah: produkTerbanyak[tahunBulan][produk],
        });
      }

      produkBulan.sort((a, b) => b.Jumlah - a.Jumlah);

      hasil.push({
        TahunBulan: tahunBulan,
        ProdukTerbanyak: produkBulan,
      });
    }

    hasil.sort((a, b) => {
      const [tahun1, bulan1] = a.TahunBulan.split("/");
      const [tahun2, bulan2] = b.TahunBulan.split("/");
      return tahun1 - tahun2 || bulan1 - bulan2;
    });
    console.log(hasil); // ini hasil produk terbanyak
    return hasil;
  }

  const hasilHitung = hitungProdukTerbanyak(data);
  const hasilFilter = hasilHitung.map((item) => ({
    ...item,
    ProdukTerbanyak: item.ProdukTerbanyak.filter((prod) => prod.Jumlah > 2),
  }));

  // console.log(JSON.stringify(hasilFilter, null, 2));
  console.log(cartt);
  // const myTreeData = [
  //   {
  //     name: "Parent Node",
  //     children: [
  //       {
  //         name: "Child Node 1",
  //         children: [
  //           { name: "Grandchild Node 1" },
  //           { name: "Grandchild Node 2" },
  //         ],
  //       },
  //       {
  //         name: "Child Node 2",
  //       },
  //     ],
  //   },
  // ];

// console.log(data);
  
function hitungPersentase(data) {
  const persentase = {};

  data?.forEach((item) => {
    const key = `${item["Tahun/Bulan"]} - ${item["Produk"]}`;
    const total = item["Earphone"] + item["Charger"] + item["Case"];

    if (total > 0) {
      const p = {
        Earphone: (item["Earphone"] / total) * 100,
        Charger: (item["Charger"] / total) * 100,
        Case: (item["Case"] / total) * 100,
      };
      persentase[key] = p;
    }
  });

  return persentase;
}

const persentaseTransaksi = hitungPersentase(data);

// Menampilkan hasil
console.log(persentaseTransaksi);

const hitungKemungkinanTransaksi = (d, produk, earphone, charger, casee, totalTransaksi) => {
  return d?.filter(item => {
    let kondisiProduk = true;
    let kondisiEarphone = true;
    let kondisiCharger = true;
    let kondisiCase = true;

    if (produk) {
      kondisiProduk = item.Produk == produk;
    }

    if (earphone) {
      kondisiEarphone = item.Earphone >= earphone;
    }

    if (charger) {
      kondisiCharger = item.Charger >= charger;
    }

    if (casee) {
      kondisiCase = item.Case >= casee;
    }
// console.log(produk);
    return kondisiProduk && kondisiEarphone && kondisiCharger && kondisiCase;
  }).length / Number(totalTransaksi) * 100;
}
// console.log(data);
const persentaseProduk = hitungKemungkinanTransaksi(data, "Produk ", 0, 0, 204);
const persentaseProdukEarphone = hitungKemungkinanTransaksi(data, "Produk , Earphone", 1, 0, 204);
const persentaseProdukCharger = hitungKemungkinanTransaksi(data, "Produk, Charger", 0, 1, 204);
const persentaseProdukCase = hitungKemungkinanTransaksi(data, "Produk , Case", 0, 0, 204);
const persentaseProdukEarphoneCharger = hitungKemungkinanTransaksi(data, "Produk , Earphone, Charger", 1, 1, 204);
const persentaseProdukEarphoneCase = hitungKemungkinanTransaksi(data, "Produk , Earphone , Case", 1, 0, 204);
const persentaseProdukChargerCase = hitungKemungkinanTransaksi(data, "Produk , Charger , Case", 0, 1, 204);
const persentaseProdukEarphoneChargerCase = hitungKemungkinanTransaksi(data, "Produk , Earphone , Charger , Case", 1, 1, 204);

console.log(`Persentase Produk: ${persentaseProduk}%`);
console.log(`Persentase Produk, Earphone: ${persentaseProdukEarphone}%`);
console.log(`Persentase Produk, Charger: ${persentaseProdukCharger}%`);
console.log(`Persentase Produk, Case: ${persentaseProdukCase}%`);
console.log(`Persentase Produk, Earphone, Charger: ${persentaseProdukEarphoneCharger}%`);
console.log(`Persentase Produk, Earphone, Case: ${persentaseProdukEarphoneCase}%`);
console.log(`Persentase Produk, Charger, Case: ${persentaseProdukChargerCase}%`);
console.log(`Persentase Produk, Earphone, Charger, Case: ${persentaseProdukEarphoneChargerCase}%`);


  return (
    <div id="treeWrapper" style={{ width: "100em", height: "100em" }}>
      {cartt && (
        <Tree
          data={cartt}
          orientation="vertical"
          translate={{ x: 100, y: 100 }}
        />
      )}
    </div>
  );
};

export default Transaksi;
