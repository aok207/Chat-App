import { Request, Response, NextFunction } from "express";

function checkFormData(req: Request, res: Response, next: NextFunction) {
  const data = req.body;

  if (Object.keys(data).length === 0) {
    throw new Error("You must provide the required data.");
  } else if (Object.values(data).some((field) => field === "")) {
    throw new Error("Please fill in every required fields.");
  } else {
    next();
  }
}

export default checkFormData;
