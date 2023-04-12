import { useSetAtom } from "jotai";
import { useState } from "react";
import { selectedVehicleAtom, vehicleRangeAtom } from "~/pages";
import { api } from "~/utils/api";

const VehicleSelection = () => {
  //Query for all years and makes
  const { data: years } = api.vehicle.getAllVehicleYears.useQuery();
  const { data: makes } = api.vehicle.getAllVehicleMakes.useQuery();

  //State for selected year, make, and model for use in queries
  const [selectedYear, setSelectedYear] = useState<string | undefined>(
    undefined
  );
  const [selectedMake, setSelectedMake] = useState<string | undefined>(
    undefined
  );
  const [selectedModel, setVehicleModel] = useState<string | undefined>(
    undefined
  );

  //Set selected vehicle in atom
  const setSelectedVehicle = useSetAtom(selectedVehicleAtom);
  //Query for all models based on selected year and make
  const { data: models } = api.vehicle.getAllVehicleModels.useQuery(
    {
      //If selectedYear or selectedMake are undefined, use an empty string
      year: selectedYear ?? "",
      make: selectedMake ?? "",
    },
    {
      //Only query if both selectedYear and selectedMake are not undefined
      enabled: !!selectedYear && !!selectedMake,
    }
  );
  //Query for vehicle based on selected year, make, and model
  api.vehicle.getVehicle.useQuery(
    {
      //If selectedYear, selectedMake, or selectedModel are undefined, use an empty string
      year: selectedYear ?? "",
      make: selectedMake ?? "",
      model: selectedModel ?? "",
    },
    {
      //Only query if all three are not undefined
      enabled: !!selectedYear && !!selectedMake && !!selectedModel,
      //Set selected vehicle in atom on success of query
      onSuccess: (data) => {
        setSelectedVehicle(data);
      },
    }
  );

  //Set vehicle range in atom
  const setVehicleRange = useSetAtom(vehicleRangeAtom);
  const setRange = (range: string) => {
    setVehicleRange(Number(range));
  };
  //Layout for vehicle selection component with dropdowns for year, make, model, and amount of gas
  return (
    <div className="flex flex-row gap-5">
      <div>
        <label
          htmlFor="years"
          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
        ></label>
        <select
          id="years"
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 "
          value={selectedYear}
          defaultValue={"Vehicle Year"}
          onChange={(val) => setSelectedYear(val.currentTarget.value)}
        >
          <option>Vehicle Year</option>
          {years?.map((year, index) => (
            <option key={index} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="makes"
          className="mb-2 block bg-gray-100 text-sm font-medium dark:text-white"
        ></label>
        <select
          id="makes"
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 "
          value={selectedMake}
          defaultValue={"Vehicle Make"}
          onChange={(val) => setSelectedMake(val.currentTarget.value)}
        >
          <option>Vehicle Make</option>
          {makes?.map((make, index) => (
            <option key={index} value={make}>
              {make}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="models"
          className="mb-2 block bg-gray-100 text-sm font-medium dark:text-white"
        ></label>
        <select
          id="models"
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:text-gray-400 "
          value={selectedModel}
          defaultValue={"Vehicle Model"}
          onChange={(val) => setVehicleModel(val.currentTarget.value)}
        >
          <option>Vehicle Model</option>
          {models?.map((model, index) => (
            <option key={index} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="gas"
          className="mb-2 block bg-gray-100 text-sm font-medium dark:text-white"
        ></label>
        <select
          id="gas"
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:text-gray-400 "
          defaultValue={"Amount of Gas"}
          // disabled={!selectedModel}
          onChange={(val) => setRange(val.currentTarget.value)}
        >
          <option selected>Amount of Gas</option>
          <option value="0.15">Near Empty</option>
          <option value="0.25">About a Quarter Full</option>
          <option value="0.5">Half Way Full</option>
          <option value="0.75">About Three Quarters Full</option>
          <option value="0.85">Near Full</option>
          <option value="1.0">Completely Full</option>
        </select>
      </div>
    </div>
  );
};

export default VehicleSelection;
