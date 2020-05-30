# Visualize Radiation Therapy Plan Data

![GitHub last commit (branch)](https://img.shields.io/github/last-commit/samujjwaal/Visualize-RT-Plan-Data/master)
![GitHub top language](https://img.shields.io/github/languages/top/samujjwaal/Visualize-RT-Plan-Data)
![GitHub repo size](https://img.shields.io/github/repo-size/samujjwaal/Visualize-RT-Plan-Data)

## Identifying Similarities and Dissimalirities Between [UIC][uic] and [MDACC][mdacc] RT Plan Data
[uic]: https://cancer.uillinois.edu/ "University of Illinois Cancer Center"
[mdacc]: https://www.mdanderson.org/ "The University of Texas MD Anderson Cancer Center"

This project was done as term project for CS529: Visual Data Science course at the University of Illinois at Chicago during the Fall 2019 term along with teammates [Md Nafiul Alam Nipu][1] & [Sanjana Srabanti][2], and in consultation with domain experts/clients [Dr. Baher Elgohari][3] & [Dr. Michael Spiotto][4].

[1]: https://github.com/nafiul-nipu
[2]: https://github.com/SanjanaSrabanti16
[3]: BElgohari@mdanderson.org "Radiation Oncologist, University of Texas"
[4]: mspiotto@uic.edu "Radiation Oncologist, Radiation Oncologist"

----

Radiation therapy is a primary modality to treat head and neck, cancer patients. In this project, we propose a novel approach to visually  correlate similarities and differences in cancer patient condition after radiation treatment. 

The system uses head and neck cancer patients' data from UIC and MDACC Radiation Therapy plan, and visualize their similarities and dissimilarities in terms of dose prescription, dose distribution, tumor size, presence of lymph node, etc. The system introduces an efficient way for the users to analyze the data and reach a decision in an easy and proficient manner.

Motivation of the project was to help oncologists to :
* Understand how different patients respond to similar RT doses
* Visualize the tumor condition of patients
* Cluster the patients as per their demographic

----
Javascript libraries used: [D3.js](https://github.com/d3/d3) and [THREE.js](https://github.com/mrdoob/three.js)

Here is the [Project Report](https://docs.google.com/document/d/1oi8C-q11IrezS6G9zEKIcqfHg5QgJ-OT4_aYK8SP0Yw/edit?usp=sharing) submitted for this project.

Here is a demo video to explain the UI of the project and various visual encodings employed.

[![Demo Video](https://img.youtube.com/vi/yJpJ_xZvsP8/0.jpg)](https://www.youtube.com/watch?v=yJpJ_xZvsP8 "Demo Video")

## Usage Details

The project can be viewed at [MedRT](https://samujjwaal.github.io/Visualize-RT-Plan-Data).

To run the project locally, open the terminal and follow these steps: 
1. Run: `git clone https://github.com/samujjwaal/Visualize-RT-Plan-Data.git`
2. Start an http server: `python -m http.server 8888`
3. Open http://localhost:8888 in a browser to view the project
