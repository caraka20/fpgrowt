import axios from "axios";
import React, { useEffect, useState } from "react";

const Transaksi = () => {
  const [data, setData] = useState(null);
  const [hasil, setHasil] = useState(null);

  const getData = async () => {
    const data = await axios.get("http://localhost:3004/transaksi");
    setData(data.data);
    setHasil(persentaseTransaksi)
    // console.log(data.data);
  };

  // Fungsi untuk menghitung persentase
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
//   console.log(persentaseTransaksi);


function createNode(name, count, parent) {
    return {
        name: name,
        count: count,
        parent: parent,
        children: {}
    };
}

function createFPTree() {
    return {
        root: createNode(null, 0, null),
        headerTable: {}
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


const fpTree = createFPTree();
if (hasil) {
for (const key in hasil) {
    const transaction = hasil[key];
    const items = Object.keys(transaction);
    const sortedItems = items.sort((a, b) => transaction[b] - transaction[a]);
    const orderedTransaction = sortedItems.map(item => item);

    addTransaction(fpTree, orderedTransaction, 1);

}    
} else {
    console.log("nblm");
}
console.log(fpTree);
  useEffect(() => {
    getData();
  }, []);
  return (
    <div>
    </div>
  );
};

export default Transaksi;
