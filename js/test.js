d3.json("data/patient_dataset.json").then(function(patients) {
    var tumor_volume = getTumorVolume(patients);
    console.log(tumor_volume);
});
function getTumorVolume(data){
    var volume = [];
    var count ;
    for (count = 0; count < data.length ; count ++){
        volume[count] = data[count].tumorVolume;
    }
    return volume;
}
