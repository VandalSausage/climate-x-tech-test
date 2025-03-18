import { processRequest } from "../api-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const Upload = () => {
  const queryClient = useQueryClient();

  const { isPending, mutate, error, data } = useMutation({
    mutationKey: ["asset_file"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    mutationFn: async (formData: FormData) =>
      processRequest({
        path: "assets/upload",
        method: "POST",
        payload: formData,
        isFormData: true,
      }),
  });
  return (
    <div className="layout">
      <h1 className="header">Upload Your Assets</h1>
      <div>{data?.message}</div>
      <div>{isPending ? "Loading..." : ""}</div>
      <p className="error">{error?.message}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          mutate(formData);
          form.reset();
        }}
      >
        <div className="form-items">
          <label htmlFor="client_id">Client Id</label>
          <input disabled={isPending} name="client_id" id="client_id" />
          <label htmlFor="assets">Your File</label>
          <input
            className="file-input"
            disabled={isPending}
            type="file"
            name="assets"
            id="assets"
          />
          <input className="submit-input" disabled={isPending} type="submit" />
        </div>
      </form>
    </div>
  );
};
